import { ObjectId } from 'mongoose';
import { IALStat } from '../models';

export interface FilterConditions {
  search: string;
  orgsArr: string[];
  subsArr: string[];
  distsArr: string[];
  provsArr: string[];
  regsArr: number[];
}

export interface FilterBodyConditions extends FilterConditions {
  page: number;
  limit: number;
}

export interface IHealthIdDashboardRepository {
  buildFilterConditions(filterParams: FilterConditions): Promise<{ organizationIds: ObjectId[] }>;
}

export default class HealthIdDashboardRepository implements IHealthIdDashboardRepository {
  public buildFilterConditions: IHealthIdDashboardRepository['buildFilterConditions'] = async (filterParams) => {
    const { search, orgsArr, subsArr, distsArr, provsArr, regsArr } = filterParams;

    const $match: any = {};
    const conditions: any[] = [];

    if (orgsArr.length > 0) {
      conditions.push({ organizationCode: { $in: orgsArr } });
    } else if (subsArr.length > 0) {
      conditions.push({ subdistrictName: { $in: subsArr } });
    } else if (distsArr.length > 0) {
      conditions.push({ districtName: { $in: distsArr } });
    } else if (provsArr.length > 0) {
      conditions.push({ provinceName: { $in: provsArr } });
    } else if (regsArr.length > 0) {
      conditions.push({ regionName: { $in: regsArr.map((reg) => `เขตสุขภาพที่ ${reg}`) } });
    }

    if (search) {
      conditions.push({
        $or: [{ organizationCode: search }, { organizationName: { $regex: search, $options: 'i' } }],
      });
    }

    if (conditions.length > 0) {
      $match.$and = conditions;
    }

    const pipeline = [{ $match }, { $group: { _id: '$organizationId' } }];

    const orgIds = await IALStat.aggregate(pipeline);
    const organizationIds = orgIds.map((org) => org._id);

    return { organizationIds };
  };
}
