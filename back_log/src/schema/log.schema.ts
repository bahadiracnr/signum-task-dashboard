import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true })
  service: string; // Hangi servis? (task, structure vs.)

  @Prop({ required: true })
  action: string; // Ne yapıldı? (create, update, delete vs.)

  @Prop({ required: true, type: Object })
  data: Record<string, any>; // Loglanan veri
}

export const LogSchema = SchemaFactory.createForClass(Log);
