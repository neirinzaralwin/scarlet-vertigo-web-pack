import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductImageDocument = ProductImage & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;

            // Convert Google Drive URL to direct URL if applicable
            if (ret.url && ret.url.includes('drive.google.com')) {
                const match = ret.url.match(/\/d\/(.+?)\//);
                if (match && match[1]) {
                    ret.url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                }
            }
        },
    },
})
export class ProductImage extends Document {
    @Prop({ type: mongoose.Types.ObjectId, ref: 'Product' })
    productId: mongoose.Types.ObjectId;

    @Prop({ type: String, required: true })
    url: string;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);
