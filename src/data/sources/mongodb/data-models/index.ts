import mongoose, { Schema } from 'mongoose';
import { IRegion, IProvince, IDistrict, ISubdistrict, IOrganization, IIALStat, IALStatType } from './type';

const regionSchema: Schema<IRegion> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const provinceSchema: Schema<IProvince> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    nameTh: { type: String, required: true },
    nameEn: { type: String, required: true },
    regionId: { type: Schema.Types.ObjectId, ref: 'regions', required: true },
  },
  { timestamps: true }
);

const districtSchema: Schema<IDistrict> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    nameTh: { type: String, required: true },
    nameEn: { type: String, required: true },
    provinceId: { type: Schema.Types.ObjectId, ref: 'provinces', required: true },
  },
  { timestamps: true }
);

const subdistrictSchema: Schema<ISubdistrict> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    nameTh: { type: String, required: true },
    nameEn: { type: String, required: true },
    zipcode: { type: String, required: true },
    districtId: { type: Schema.Types.ObjectId, ref: 'districts', required: true },
  },
  { timestamps: true }
);

const organizationSchema: Schema<IOrganization> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subdistrictId: { type: Schema.Types.ObjectId, ref: 'subdistricts', required: true },
  },
  { timestamps: true }
);

const ialstatSchema: Schema<IIALStat> = new Schema(
  {
    totalPopulation: { type: String },
    dateCutoff: { type: Date },
    ialStats: { type: Map, of: Number, enum: Object.values(IALStatType) },
    organizationId: { type: Schema.Types.ObjectId, ref: 'organizations', required: true },
    organizationCode: { type: String, required: true },
    organizationName: { type: String, required: true },
    subdistrictName: { type: String, required: true },
    districtName: { type: String, required: true },
    provinceName: { type: String, required: true },
    regionName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Region = mongoose.model<IRegion>('regions', regionSchema, 'regions');
export const Province = mongoose.model<IProvince>('provinces', provinceSchema, 'provinces');
export const District = mongoose.model<IDistrict>('districts', districtSchema, 'districts');
export const Subdistrict = mongoose.model<ISubdistrict>('subdistricts', subdistrictSchema, 'subdistricts');
export const Organization = mongoose.model<IOrganization>('organizations', organizationSchema, 'organizations');
export const IALStat = mongoose.model<IIALStat>('ialstats', ialstatSchema, 'ialstats');
