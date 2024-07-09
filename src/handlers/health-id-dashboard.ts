import { ParsedQs } from 'qs';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { FilterBodyConditions } from '../repositories/health-id-dashboard';
import { IHealthIdDashboardUsecase } from '../usecases/health-id-dashboard';

interface IHealthIdDashboardHandler {
  fetchGeolocation: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
  fetchTooltip: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
  fetchBarchart: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
  fecthTable: RequestHandler<ParamsDictionary, any, FilterBodyConditions, ParsedQs, Record<string, any>>;
}

export default class HealthIdDashboardHandler implements IHealthIdDashboardHandler {
  constructor(private readonly usecase: IHealthIdDashboardUsecase) {}

  public fetchGeolocation: IHealthIdDashboardHandler['fetchGeolocation'] = async (req, res) => {};

  public fetchTooltip: IHealthIdDashboardHandler['fetchTooltip'] = async (req, res) => {};

  public fetchBarchart: IHealthIdDashboardHandler['fetchBarchart'] = async (req, res) => {};

  public fecthTable: IHealthIdDashboardHandler['fecthTable'] = async (req, res) => {
    const { page, limit, ...filterParams } = req.body;
    const { search, orgsArr, subsArr, distsArr, provsArr, regsArr } = filterParams;

    const filterArguments = { search, orgsArr, subsArr, distsArr, provsArr, regsArr };

    try {
      const data = await this.usecase.fecthTable({ page, limit, ...filterArguments });
      return res.status(200).json({ status: true, message: 'success', ...data });
    } catch (error) {
      console.error('Error during process fetch tables:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' }).end();
    }
  };
}
