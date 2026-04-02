import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Response } from 'express';
import {
  REQUEST_ID_HEADER,
  REQUEST_ID_KEY,
} from '../../common/constants/request.constants';
import { RequestWithContext } from '../../common/interfaces/request-with-context.interface';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const incomingRequestId = req.header(REQUEST_ID_HEADER);
    const requestId = incomingRequestId || randomUUID();

    req[REQUEST_ID_KEY] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
