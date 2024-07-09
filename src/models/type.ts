import { Document, ObjectId } from 'mongoose';

export enum IALStatType {
  ยืนยันด้วยบัตรประชาชน = 'ยืนยันด้วยบัตรประชาชน',
  ยืนยันด้วยOTP = 'ยืนยันด้วย OTP',
}

export interface IRegion extends Document {
  code: string;
  name: string;
}

export interface IProvince extends Document {
  code: string;
  nameTh: string;
  nameEn: string;
  regionId: ObjectId;
}

export interface IDistrict extends Document {
  code: string;
  nameTh: string;
  nameEn: string;
  provinceId: ObjectId;
}

export interface ISubdistrict extends Document {
  code: string;
  nameTh: string;
  nameEn: string;
  zipcode: string;
  districtId: ObjectId;
}

export interface IOrganization extends Document {
  code: string;
  name: string;
  subdistrictId: ObjectId;
}

export interface IIALStat extends Document {
  dateCutoff: Date;
  totalPopulation: string;
  ialStats: Record<IALStatType, number>;
  organizationId: ObjectId;
  organizationCode: string;
  organizationName: string;
  subdistrictName: string;
  districtName: string;
  provinceName: string;
  regionName: string;
}
