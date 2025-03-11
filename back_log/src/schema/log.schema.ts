import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true })
  service: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true, type: Object })
  data: Record<string, any>;
}

export const LogSchema = SchemaFactory.createForClass(Log);
