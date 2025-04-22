import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SizeDocument = Size & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
})
export class Size extends Document {
    @Prop({ type: String })
    name: string;
}

export const SizeSchema = SchemaFactory.createForClass(Size);
