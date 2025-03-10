import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from '../schema/log.schema';

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  async createLog(
    service: string,
    action: string,
    data: Record<string, any>,
  ): Promise<Log> {
    const newLog = new this.logModel({ service, action, data });
    return newLog.save();
  }

  async getLogs(): Promise<Log[]> {
    return this.logModel.find().sort({ createdAt: -1 }).exec();
  }
}
