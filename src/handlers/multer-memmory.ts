import { ParsedQs } from 'qs';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { parse } from 'csv-parse';

import { District, Province, Region, Subdistrict } from '../models';

interface IMulterMemmoryHandler {
  createRegions: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
  createProvinces: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
  createDistricts: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
  createSubdistricts: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
}

export default class MulterMemmoryHandler implements IMulterMemmoryHandler {
  public createRegions: IMulterMemmoryHandler['createRegions'] = async (req, res) => {
    if (!req.file) return res.status(400).json({ status: false, message: 'No file uploaded.' }).end();

    const parser = { delimiter: ',', columns: true };

    return parse(req.file.buffer.toString(), parser, async (error, regions: any[]) => {
      if (error) {
        console.error('Error parsing CSV:', error);
        return res.status(500).json({ status: false, message: 'Error processing CSV file' }).end();
      }

      let count: number = 0;
      let batch: any[] = [];
      const batchSize: number = 10;

      try {
        for (const region of regions) {
          batch.push({
            updateOne: {
              filter: { code: region.code },
              update: {
                $set: { code: region.code, name: region.name },
              },
              upsert: true,
            },
          });

          if (batch.length === batchSize) {
            await Region.bulkWrite(batch);
            batch = [];
            count++;
            console.log(count);
          }
        }

        if (batch.length > 0) {
          await Region.bulkWrite(batch);
          count++;
          console.log(count);
        }

        console.log('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        return res.status(500).send('Error importing data');
      }

      return res.status(200).json({ message: 'File processed successfully' });
    });
  };

  public createProvinces: IMulterMemmoryHandler['createProvinces'] = async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const parser = { delimiter: ',', columns: true };

    return parse(req.file.buffer.toString(), parser, async (error, provinces: any[]) => {
      if (error) {
        console.error('Error parsing CSV:', error);
        return res.status(500).send('Error processing CSV file');
      }

      let count: number = 0;
      let batch: any[] = [];
      const batchSize: number = 10;

      try {
        const regions = await Region.find().lean();
        const regionMap = new Map(regions.map((reg) => [reg.code.toString(), reg._id]));

        for (const province of provinces) {
          batch.push({
            updateOne: {
              filter: { code: province.code },
              update: {
                $set: {
                  code: province.code,
                  nameTh: province.nameTh,
                  nameEn: province.nameEn,
                  regionId: regionMap.get(province.regionId),
                },
              },
              upsert: true,
            },
          });

          if (batch.length === batchSize) {
            await Province.bulkWrite(batch);
            batch = [];
            count++;
            console.log(count);
          }
        }

        if (batch.length > 0) {
          await Province.bulkWrite(batch);
          count++;
          console.log(count);
        }

        console.log('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        return res.status(500).send('Error importing data');
      }

      return res.status(200).json({ message: 'File processed successfully' });
    });
  };

  public createDistricts: IMulterMemmoryHandler['createDistricts'] = async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const parser = { delimiter: ',', columns: true };

    return parse(req.file.buffer.toString(), parser, async (error, districts: any[]) => {
      if (error) {
        console.error('Error parsing CSV:', error);
        return res.status(500).send('Error processing CSV file');
      }

      let count: number = 0;
      let batch: any[] = [];
      const batchSize: number = 10;

      try {
        const provinces = await Province.find().lean();
        const provinceMap = new Map(provinces.map((prov) => [prov.code.toString(), prov._id]));

        for (const district of districts) {
          batch.push({
            updateOne: {
              filter: { code: district.id },
              update: {
                $set: {
                  code: district.id,
                  nameTh: district.name_th,
                  nameEn: district.name_en,
                  provinceId: provinceMap.get(district.province_id),
                },
              },
              upsert: true,
            },
          });

          if (batch.length === batchSize) {
            await District.bulkWrite(batch);
            batch = [];
            count++;
            console.log(count);
          }
        }

        if (batch.length > 0) {
          await District.bulkWrite(batch);
          count++;
          console.log(count);
        }

        console.log('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        return res.status(500).send('Error importing data');
      }

      return res.status(200).json({ message: 'File processed successfully' });
    });
  };

  public createSubdistricts: IMulterMemmoryHandler['createSubdistricts'] = async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const parser = { delimiter: ',', columns: true };

    return parse(req.file.buffer.toString(), parser, async (error, subdistricts: any[]) => {
      if (error) {
        console.error('Error parsing CSV:', error);
        return res.status(500).send('Error processing CSV file');
      }

      let count: number = 1;
      let batch: any[] = [];
      const batchSize: number = 10;

      try {
        const districts = await District.find().lean();
        const districtMap = new Map(districts.map((dist) => [dist.code.toString(), dist._id]));

        for (const subdistrict of subdistricts) {
          batch.push({
            updateOne: {
              filter: { code: subdistrict.id },
              update: {
                $set: {
                  code: subdistrict.id,
                  nameTh: subdistrict.name_th,
                  nameEn: subdistrict.name_en,
                  zipcode: subdistrict.zipcode,
                  districtId: districtMap.get(subdistrict.amphure_id),
                },
              },
              upsert: true,
            },
          });

          if (batch.length === batchSize) {
            await Subdistrict.bulkWrite(batch);
            batch = [];
            count++;
            console.log(count);
          }
        }

        if (batch.length > 0) {
          await Subdistrict.bulkWrite(batch);
          count++;
          console.log(count);
        }

        console.log('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        return res.status(500).send('Error importing data');
      }

      return res.status(200).json({ message: 'File processed successfully' });
    });
  };
}
