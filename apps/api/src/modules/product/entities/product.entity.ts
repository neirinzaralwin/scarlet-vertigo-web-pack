import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { ProductImage } from './product-image.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/modules/category/entities/category.entity';
import { Size } from 'src/modules/size/entities/size.entity';

export type ProductDocument = Product & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            if (ret.price) ret.price = ret.price.toString();
            if (!ret.category) ret.category = null;
            if (!ret.size) ret.size = null;
        },
    },
})
export class Product extends Document {
    @ApiProperty({ description: 'Product name', type: String })
    @Prop({ type: String })
    name: string;

    @ApiProperty({ description: 'Product description', type: String })
    @Prop({ type: String })
    description: string;

    @ApiProperty({ description: 'Product price', type: String })
    @Prop({ type: mongoose.Types.Decimal128 })
    price: mongoose.Types.Decimal128;

    @ApiProperty({ description: 'Product stock', type: Number })
    @Prop({ type: Number })
    stock: number;

    @ApiProperty({ description: 'Product images', type: [ProductImage] })
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductImage' }] })
    images: mongoose.Types.ObjectId[] | ProductImage[];

    @ApiProperty({ description: 'Product created time', type: String, default: Date.now })
    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @ApiProperty({ description: 'Product created time', type: String })
    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

    @ApiProperty({ description: 'Product category', type: Category })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
    category: mongoose.Types.ObjectId;

    @ApiProperty({ description: 'Product size', type: Size })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Size' })
    size: mongoose.Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
