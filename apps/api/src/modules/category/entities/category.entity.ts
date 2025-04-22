import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
})
export class Category extends Document {
    @Prop({ type: String })
    name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
