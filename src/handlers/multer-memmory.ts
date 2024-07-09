import { ParsedQs } from 'qs';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { parse } from 'csv-parse';

import { District, Province, Region, Subdistrict } from '../models';

interface ITimestampDto {
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface IRegionCsvDto {
  code: string;
  name: string;
}

interface IProvinceCsvDto {
  code: string;
  nameTh: string;
  nameEn: string;
  regionId: string;
  geographyCode: string;
}

interface IDistrictCsvDto extends ITimestampDto {
  id: string;
  name_th: string;
  name_en: string;
  province_id: string;
}

interface ISubdistrictCsvDto extends ITimestampDto {
  id: string;
  zipcode: string;
  name_th: string;
  name_en: string;
  amphure_id: string;
}

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

    return parse(req.file.buffer.toString(), parser, async (error, regions: IRegionCsvDto[]) => {
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
            try {
              await Region.bulkWrite(batch);
              count++;
              console.log(`Processed batch ${count}`);
              batch = [];
            } catch (error) {
              console.error('Error processing batch:', error);
              return res.status(500).send('Error processing batch');
            }
          }
        }

        if (batch.length > 0) {
          try {
            await Region.bulkWrite(batch);
            count++;
            console.log(`Processed final batch ${count}`);
          } catch (error) {
            console.error('Error processing final batch:', error);
            return res.status(500).send('Error processing final batch');
          }
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

    return parse(req.file.buffer.toString(), parser, async (error, provinces: IProvinceCsvDto[]) => {
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
          if (province.code) {
            const regionId = regionMap.get(province.regionId);
            if (!regionId) continue;

            batch.push({
              updateOne: {
                filter: { code: province.code },
                update: {
                  $set: {
                    nameTh: province.nameTh || 'Unknown',
                    nameEn: province.nameEn || 'Unknown',
                    regionId: regionId || null,
                  },
                },
                upsert: true,
              },
            });

            if (batch.length === batchSize) {
              try {
                await Province.bulkWrite(batch);
                count++;
                console.log(`Processed batch ${count}`);
                batch = [];
              } catch (error) {
                console.error('Error processing batch:', error);
                return res.status(500).send('Error processing batch');
              }
            }
          }
        }

        if (batch.length > 0) {
          try {
            await Province.bulkWrite(batch);
            count++;
            console.log(`Processed final batch ${count}`);
          } catch (error) {
            console.error('Error processing final batch:', error);
            return res.status(500).send('Error processing final batch');
          }
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

    return parse(req.file.buffer.toString(), parser, async (error, districts: IDistrictCsvDto[]) => {
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
          if (district.id) {
            const provinceId = provinceMap.get(district.province_id);
            if (!provinceId) continue;

            batch.push({
              updateOne: {
                filter: { code: district.id },
                update: {
                  $set: {
                    nameTh: district.name_th,
                    nameEn: district.name_en,
                    provinceId: provinceMap.get(district.province_id),
                  },
                },
                upsert: true,
              },
            });

            if (batch.length === batchSize) {
              try {
                await District.bulkWrite(batch);
                batch = [];
                count++;
                console.log(count);
                console.log(`Processed batch ${count}`);
              } catch (error) {
                console.error('Error processing batch:', error);
                return res.status(500).send('Error processing batch');
              }
            }
          }
        }

        if (batch.length > 0) {
          try {
            await District.bulkWrite(batch);
            count++;
            console.log(count);
            console.log(`Processed final batch ${count}`);
          } catch (error) {
            console.error('Error processing final batch:', error);
            return res.status(500).send('Error processing final batch');
          }
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

    return parse(req.file.buffer.toString(), parser, async (error, subdistricts: ISubdistrictCsvDto[]) => {
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
          if (subdistrict.id) {
            const districtId = districtMap.get(subdistrict.amphure_id);
            if (!districtId) continue;

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
              try {
                await Subdistrict.bulkWrite(batch);
                batch = [];
                count++;
                console.log(`Processed final batch ${count}`);
              } catch (error) {
                console.error('Error processing batch:', error);
                return res.status(500).send('Error processing batch');
              }
            }
          }
        }

        if (batch.length > 0) {
          try {
            await Subdistrict.bulkWrite(batch);
            count++;
            console.log(`Processed final batch ${count}`);
          } catch (error) {
            console.error('Error processing final batch:', error);
            return res.status(500).send('Error processing final batch');
          }
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
