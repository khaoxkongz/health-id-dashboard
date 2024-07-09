import { IALStat } from '../models';
import { IIALStat } from '../models/type';
import { FilterBodyConditions, IHealthIdDashboardRepository } from '../repositories/health-id-dashboard';

enum IALStatus {
  OTP = 'ยืนยันด้วย OTP',
  IDCard = 'ยืนยันตัวตนด้วยบัตรประชาชน',
}

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

  private calculateTotalCountIdAll = (allIalStats: any[]): number => {
    return allIalStats.reduce((total, stat) => {
      let countIdOtp = 0;
      let countIdCard = 0;

      stat.ialStats.forEach(({ status, count }: { status: string; count: number }) => {
        if (status === IALStatus.OTP) {
          countIdOtp += count;
        } else if (status === IALStatus.IDCard) {
          countIdCard += count;
        }
      });

      return total + countIdOtp + countIdCard;
    }, 0);
  };

  private enrichIalStatsWithRelatedData = async (ialStats: IIALStat[]): Promise<any[]> => {
    return ialStats.map((stat) => {
      let countIdOtp = 0;
      let countIdCard = 0;

      stat.ialStats.forEach(({ status, count }: { status: string; count: number }) => {
        if (status === IALStatus.OTP) {
          countIdOtp += count;
        } else if (status === IALStatus.IDCard) {
          countIdCard += count;
        }
      });

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
