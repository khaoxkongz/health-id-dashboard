import fs from 'fs';
import { parse } from 'csv-parse';

import { ParsedQs } from 'qs';
import { ParamsDictionary } from 'express-serve-static-core';
import { RequestHandler } from 'express';

import { IALStat, Organization, Subdistrict } from '../models';

interface IMulterDiskHandler {
  createOrganization: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
  createIalStat: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
}

export default class MulterDiskHandler implements IMulterDiskHandler {
  public createOrganization: IMulterDiskHandler['createOrganization'] = async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    let count = 0;
    let batch: any[] = [];
    const batchSize = 5000;

    const anyArr: any[] = [];

    const parser = parse({ delimiter: ',', columns: true });
    const stream = fs.createReadStream(req.file.path).pipe(parser);

    try {
      const subdistricts = await Subdistrict.find().lean();
      const subdistrictMap = new Map(subdistricts.map((s) => [s.nameTh, s._id]));

      for await (const row of stream) {
        const subdistrictId = subdistrictMap.get(row.subdistrict_health as string);
        if (!subdistrictId) continue;

        if (row.organization_code) {
          batch.push({
            updateOne: {
              filter: { code: row.organization_code },
              update: {
                $set: {
                  name: row.organization_name || 'Unknown',
                  subdistrictId: subdistrictId || null,
                },
              },
              upsert: true,
            },
          });

          if (batch.length >= batchSize) {
            try {
              await Organization.bulkWrite(batch);
              count++;
              console.log(`Processed batch ${count}`);
              batch = [];
            } catch (error) {
              console.error('Error processing batch:', error);
              throw error;
            }
          }
        }
      }

      if (batch.length > 0) {
        try {
          await Organization.bulkWrite(batch);
          count++;
          console.log(`Processed final batch ${count}`);
        } catch (error) {
          console.error('Error processing final batch:', error);
          throw error;
        }
      }

      await fs.promises.unlink(req.file.path);
      console.log('Data imported successfully');
      return res
        .status(200)
        .json({ status: true, message: 'File processed successfully', count: anyArr.length, data: anyArr })
        .end();
    } catch (error) {
      await fs.promises.unlink(req.file.path);
      console.error('Error processing file:', error);
      return res.status(500).json({ status: false, message: 'An error occurred while processing the file.' }).end();
    }
  };

  public createIalStat: IMulterDiskHandler['createIalStat'] = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    let count = 0;
    let batch: any[] = [];
    const batchSize = 5000;

    const anyArr: any[] = [];

    const parser = parse({ delimiter: ',', columns: true });
    const stream = fs.createReadStream(req.file.path).pipe(parser);

    try {
      const organizations = await Organization.find().lean();
      const organizationMap = new Map(organizations.map((org) => [org.code, org._id]));

      for await (const row of stream) {
        if (row.organization_code && row.ial_status) {
          const organizationId = organizationMap.get(row.organization_code);
          if (!organizationId) continue;

          batch.push({
            updateOne: {
              filter: {
                organizationId: organizationId,
                dateCutoff: new Date(row.date_cutoff),
              },
              update: {
                $set: {
                  totalPopulation: row.total_population || '0',
                  organizationCode: row.organization_code,
                  organizationName: row.organization_name || 'Unknown',
                  subdistrictName: row.subdistrict_health || 'Unknown',
                  districtName: row.district_health || 'Unknown',
                  provinceName: row.province_health || row.province || 'Unknown',
                  regionName: row.service_area_health || 'Unknown',
                },
                $inc: {
                  [`ialStats.${row.ial_status}`]: row.count_ial || 0,
                },
              },
              upsert: true,
            },
          });

          if (batch.length >= batchSize) {
            try {
              await IALStat.bulkWrite(batch);
              count++;
              console.log(`Processed batch ${count}`);
              batch = [];
            } catch (error) {
              console.error('Error processing batch:', error);
              throw error;
            }
          }
        }
      }

      if (batch.length > 0) {
        try {
          await IALStat.bulkWrite(batch);
          count++;
          console.log(`Processed final batch ${count}`);
        } catch (error) {
          console.error('Error processing batch:', error);
          throw error;
        }
      }

      await fs.promises.unlink(req.file.path);
      console.log('Data imported successfully');
      return res
        .status(200)
        .json({ status: true, message: 'File processed successfully', count: anyArr.length, data: anyArr })
        .end();
    } catch (error) {
      await fs.promises.unlink(req.file.path);
      console.error('Error processing file:', error);
      return res.status(500).json({ status: false, message: 'An error occurred while processing the file.' }).end();
    }
  };
}
