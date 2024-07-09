import 'dotenv/config';

import mongoose from 'mongoose';
import { FindCursor, MongoClient, ObjectId, WithId } from 'mongodb';

import { IALStat, Organization, Subdistrict } from '../../data/sources/mongodb/data-models';

interface CollectionHealthId extends Document {
  _id: ObjectId;
  ial_status: 'ยืนยันด้วยบัตรประชาชน' | 'ยืนยันด้วย OTP' | null;
  count_ial: number | null;
  organization_code: string | null;
  organization_name: string | null;
  province_health: string | null;
  district_health: string | null;
  subdistrict_health: string | null;
  service_area_health: string | null;
  province: string | null;
  total_population: string | null;
  date_cutoff: Date;
  time_date_cutoff: string;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
}

const dbName = 'healthid-db';
const MONGODB_URI = `mongodb://healthid:Tropl6Lcho1ra7r@192.168.31.11:27017/healthid-db?authSource=admin&directConnection=true&ssl=false`;
const client = new MongoClient(MONGODB_URI);

const db = client.db(dbName);
const collection = db.collection<CollectionHealthId>('table_etl_health_id');

let round = 0;
let batch: any[] = [];
const batchSize = 5000;

const createOrganization = async (cursor: FindCursor<WithId<CollectionHealthId>>) => {
  const subdistricts = await Subdistrict.find({}, 'nameTh _id').lean();
  const subdistrictMap = new Map(subdistricts.map((s) => [s.nameTh, s._id]));

  for await (const row of cursor) {
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
          round++;
          console.log(`Processed batch ${round}`);
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
      round++;
      console.log(`Processed final batch ${round}`);
    } catch (error) {
      console.error('Error processing final batch:', error);
      throw error;
    }
  }

  console.log('Data imported successfully');
};

const createIalStat = async (cursor: FindCursor<WithId<CollectionHealthId>>) => {
  const organizations = await Organization.find({}, 'code _id').lean();
  const organizationMap = new Map(organizations.map((org) => [org.code, org._id]));

  for await (const row of cursor) {
    if (row.organization_code && row.ial_status) {
      const organizationId = organizationMap.get(row.organization_code);
      if (!organizationId) continue;

      batch.push({
        updateOne: {
          filter: {
            organizationId: organizationId,
            dateCutoff: row.date_cutoff,
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
          round++;
          console.log(`Processed batch ${round}`);
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
      round++;
      console.log(`Processed final batch ${round}`);
    } catch (error) {
      console.error('Error processing final batch:', error);
      throw error;
    }
  }

  console.log('Data imported successfully');
};

const main = async (): Promise<void> => {
  try {
    const cursor = collection.find({});
    await createOrganization(cursor);
    console.log('Created organization successfully');
    await createIalStat(cursor);
    console.log('Created ial stat successfully');
  } catch (error) {
    console.error('Error during import process:', error);
  }
};

const startServer = async (): Promise<void> => {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB with Mongodb Driver');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully to MongoDB with Mongoose Driver');
    await main();
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    await mongoose.disconnect();
    await client.close();
  }
};

startServer();
