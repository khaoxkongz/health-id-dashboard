import { Document, ObjectId } from 'mongoose';

export interface IRegion extends Document {
  code: number;
  name: string;
}

export interface IProvince extends Document {
  code: number;
  nameTh: string;
  nameEn: string;
  regionId: ObjectId;
}

export interface IDistrict extends Document {
  code: number;
  nameTh: string;
  nameEn: string;
  provinceId: ObjectId;
}

export interface ISubdistrict extends Document {
  code: number;
  nameTh: string;
  nameEn: string;
  zipcode: number;
  districtId: ObjectId;
}

export interface IOrganization extends Document {
  code: string;
  name: string;
  subdistrictId: ObjectId;
}

export interface IIALStat extends Document {
  dateCutoff: Date;
  totalPopulation: number;
  ialStats: Array<{ status: string; count: number }>;
  organizationId: ObjectId;
  organizationCode: string;
  organizationName: string;
  subdistrictName: string;
  districtName: string;
  provinceName: string;
  regionName: string;
}
