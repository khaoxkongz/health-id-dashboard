import { IALStat } from '../../data/sources/mongodb/data-models';
import { IIALStat } from '../../data/sources/mongodb/data-models/type';
import { FilterBodyConditions, IHealthIdDashboardRepository } from '../repositories/health-id-dashboard';

export interface IHealthIdDashboardUsecase {
  fecthTable(filterParams: FilterBodyConditions): Promise<any>;
}

export default class HealthIdDashboardUsecase implements IHealthIdDashboardUsecase {
  constructor(private readonly repo: IHealthIdDashboardRepository) {}

  public fecthTable: IHealthIdDashboardUsecase['fecthTable'] = async (filterParams) => {
    const { page, limit, ...filterConditions } = filterParams;
    const { search, orgsArr, subsArr, distsArr, provsArr, regsArr } = filterConditions;

    const regionsCodeArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    if (regsArr.length === 0) regsArr.push(...regionsCodeArr);

    const filterArguments = { search, orgsArr, subsArr, distsArr, provsArr, regsArr };

    const { organizationIds } = await this.repo.buildFilterConditions(filterArguments);

    const skip = (page - 1) * limit;

    const [ialStats, [{ totalCount = 0 } = {}]] = await Promise.all([
      IALStat.aggregate([{ $match: { organizationId: { $in: organizationIds } } }, { $skip: skip }, { $limit: limit }]),
      IALStat.aggregate([{ $match: { organizationId: { $in: organizationIds } } }, { $count: 'totalCount' }]),
    ]);

    const enrichedIalStats = await this.enrichIalStatsWithRelatedData(ialStats);

    const allIalStats = await IALStat.aggregate([{ $match: { organizationId: { $in: organizationIds } } }]);
    const totalCountIdAll = this.calculateTotalCountIdAll(allIalStats);

    const paginate = { currentPage: page, totalPages: Math.ceil(totalCount / limit), totalCount };

    const dto = { ...paginate, totalCountIdAll: totalCountIdAll.toLocaleString(), data: enrichedIalStats };
    return { ...dto };
  };

  private calculateTotalCountIdAll = (allIalStats: IIALStat[]): number => {
    return allIalStats.reduce((total, stat) => {
      let countIdOtp = 0;
      let countIdCard = 0;

      if (stat.ialStats['ยืนยันด้วย OTP']) countIdOtp += stat.ialStats['ยืนยันด้วย OTP'];

      if (stat.ialStats['ยืนยันด้วยบัตรประชาชน']) countIdCard += stat.ialStats['ยืนยันด้วยบัตรประชาชน'];

      return total + countIdOtp + countIdCard;
    }, 0);
  };

  private enrichIalStatsWithRelatedData = async (ialStats: IIALStat[]): Promise<any[]> => {
    return ialStats.map((stat) => {
      let countIdOtp = 0;
      let countIdCard = 0;

      if (stat.ialStats['ยืนยันด้วย OTP']) countIdOtp += stat.ialStats['ยืนยันด้วย OTP'];

      if (stat.ialStats['ยืนยันด้วยบัตรประชาชน']) countIdCard += stat.ialStats['ยืนยันด้วยบัตรประชาชน'];

      const totalCountId = countIdOtp + countIdCard;

      return {
        organizationCode: stat.organizationCode,
        organizationName: stat.organizationName,
        subdistrictName: stat.subdistrictName,
        districtName: stat.districtName,
        provinceName: stat.provinceName,
        regionName: stat.regionName,
        countIdOtp: countIdOtp.toLocaleString(),
        countIdCard: countIdCard.toLocaleString(),
        totalCountId: totalCountId.toLocaleString(),
      };
    });
  };
}
