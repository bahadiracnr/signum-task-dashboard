import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kafka, Consumer } from 'kafkajs';
import { Log, LogDocument } from '../schema/log.schema';

@Injectable()
export class LogService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'log-service',
    brokers: ['localhost:9092'],
  });

  private consumer: Consumer;
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  async onModuleInit() {
    this.consumer = this.kafka.consumer({ groupId: 'log-group' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'logs', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const logData = JSON.parse(message.value?.toString() || '{}');
        console.log('logData', logData);
        await new this.logModel(logData).save();
      },
    });
  }

  async createLog(
    service: string,
    action: string,
    data: Record<string, any>,
  ): Promise<Log> {
    const newLog = new this.logModel({ service, action, data });
    return await newLog.save();
  }

  async getLogs(): Promise<Log[]> {
    return this.logModel.find().sort({ createdAt: -1 }).exec();
  }
}
