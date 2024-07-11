import { Response } from 'express';

enum Status {
  Ok = 'true',
  Err = 'false',
}

enum Message {
  Ok = 'success',
  Err = 'error',
}

enum Codes {
  Ok = 200,
  Created = 201,
  Updated = 204,
  Deleted = 204,
  BadRequest = 400,
  UnAuthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}

enum Bodies {
  NotImplemented = 'api not yet implemented',
  MissingField = 'missing field',
  MissingParam = 'missing param',
  InvalidField = 'invalid field',
}

export default class JsonResponse {
  private readonly code: Codes;
  private readonly status: Status;
  private readonly body: any;

  constructor(code: number, body: any) {
    this.code = code;
    this.status = code < 400 ? Status.Ok : Status.Err;
    this.body = body;
  }

  public marshal = (res: Response, field: string): Response<any, Record<string, any>> => {
    const responseMap = new Map<string, any>().set('status', this.status);

    if (this.status === Status.Err) {
      responseMap.set(field, this.body);
    } else {
      responseMap.set('message', Message.Ok).set('data', this.body);
    }

    const responseObject = Object.fromEntries(responseMap);
    return res.status(this.code).json(responseObject).end();
  };

  static respond = (res: Response, code: number, field: string, body: any) => {
    return new JsonResponse(code, body).marshal(res, field);
  };

  static Ok = (res: Response, data: any) => {
    return JsonResponse.respond(res, Codes.Ok, 'data', data);
  };

  static Created = (res: Response, data: any) => {
    return JsonResponse.respond(res, Codes.Created, 'data', data);
  };

  static BadRequest = (res: Response, reason: string) => {
    return JsonResponse.respond(res, Codes.BadRequest, 'message', reason);
  };

  static MissingField = (res: Response, field: string) => {
    const reason = `${Bodies.MissingField}: ${field}`;
    return JsonResponse.respond(res, Codes.BadRequest, 'message', reason);
  };

  static MissingParam = (res: Response, param: string) => {
    const reason = `${Bodies.MissingParam}: ${param}`;
    return JsonResponse.respond(res, Codes.BadRequest, 'message', reason);
  };

  static UnAuthorized = (res: Response, reason: string) => {
    return JsonResponse.respond(res, Codes.UnAuthorized, 'message', reason);
  };

  static NotFound = (res: Response, reason: string) => {
    return JsonResponse.respond(res, Codes.NotFound, 'message', reason);
  };

  static InternalServerError = (res: Response, reason: string) => {
    return JsonResponse.respond(res, Codes.InternalServerError, 'message', reason);
  };
}
