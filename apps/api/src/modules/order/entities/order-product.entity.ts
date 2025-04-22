import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';

export type OrderProductDocument = OrderProduct & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            ret.price = ret.price.toString();
        },
    },
})
export class OrderProduct extends Document {
    @ApiProperty({ description: 'Order id', type: String })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
    orderId: mongoose.Types.ObjectId;

    @ApiProperty({ description: 'Product', type: Product })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: mongoose.Types.ObjectId | Product;

    @ApiProperty({ description: 'Quantity of product' })
    @Prop({ type: Number })
    quantity: number;

    @ApiProperty({ description: 'Price of product', type: String })
    @Prop({ type: mongoose.Types.Decimal128 })
    price: mongoose.Types.Decimal128;
}

export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);
