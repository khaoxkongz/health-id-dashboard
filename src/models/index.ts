import mongoose, { Schema } from 'mongoose';
import { IRegion, IProvince, IDistrict, ISubdistrict, IOrganization, IIALStat, IALStatType } from './type';

const regionSchema: Schema<IRegion> = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

regionSchema.index({ code: 1 });

const provinceSchema: Schema<IProvince> = new Schema({
  code: { type: String, required: true, unique: true },
  nameTh: { type: String, required: true },
  nameEn: { type: String, required: true },
  regionId: { type: Schema.Types.ObjectId, ref: 'regions', required: true },
});

provinceSchema.index({ code: 1 });
provinceSchema.index({ regionId: 1 });

const districtSchema: Schema<IDistrict> = new Schema({
  code: { type: String, required: true, unique: true },
  nameTh: { type: String, required: true },
  nameEn: { type: String, required: true },
  provinceId: { type: Schema.Types.ObjectId, ref: 'provinces', required: true },
});

districtSchema.index({ code: 1 });
districtSchema.index({ provinceId: 1 });

const subdistrictSchema: Schema<ISubdistrict> = new Schema({
  code: { type: String, required: true, unique: true },
  nameTh: { type: String, required: true },
  nameEn: { type: String, required: true },
  zipcode: { type: String, required: true },
  districtId: { type: Schema.Types.ObjectId, ref: 'districts', required: true },
});

subdistrictSchema.index({ code: 1 });
subdistrictSchema.index({ districtId: 1 });
subdistrictSchema.index({ zipcode: 1 });

const organizationSchema: Schema<IOrganization> = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subdistrictId: { type: Schema.Types.ObjectId, ref: 'subdistricts', required: true },
});

organizationSchema.index({ code: 1 });
organizationSchema.index({ subdistrictId: 1 });

const ialstatSchema: Schema<IIALStat> = new Schema({
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
});

ialstatSchema.index({ dateCutoff: -1 });
ialstatSchema.index({ 'ialStats.status': 1 });
ialstatSchema.index({ organizationId: 1 });
ialstatSchema.index({ organizationCode: 1 });
ialstatSchema.index({ organizationName: 1 });
ialstatSchema.index({ subdistrictName: 1 });
ialstatSchema.index({ districtName: 1 });
ialstatSchema.index({ provinceName: 1 });
ialstatSchema.index({ regionName: 1 });
ialstatSchema.index({ 'ialStats.status': 1, organizationCode: 1, organizationName: 1 });
ialstatSchema.index({ 'ialStats.status': 1, organizationCode: 1 });
ialstatSchema.index({ 'ialStats.status': 1, organizationName: 1 });
ialstatSchema.index({ 'ialStats.status': 1, subdistrictName: 1 });
ialstatSchema.index({ 'ialStats.status': 1, districtName: 1 });
ialstatSchema.index({ 'ialStats.status': 1, provinceName: 1 });
ialstatSchema.index({ 'ialStats.status': 1, regionName: 1 });

export const Region = mongoose.model<IRegion>('regions', regionSchema, 'regions');
export const Province = mongoose.model<IProvince>('provinces', provinceSchema, 'provinces');
export const District = mongoose.model<IDistrict>('districts', districtSchema, 'districts');
export const Subdistrict = mongoose.model<ISubdistrict>('subdistricts', subdistrictSchema, 'subdistricts');
export const Organization = mongoose.model<IOrganization>('organizations', organizationSchema, 'organizations');
export const IALStat = mongoose.model<IIALStat>('ialstats', ialstatSchema, 'ialstats');
