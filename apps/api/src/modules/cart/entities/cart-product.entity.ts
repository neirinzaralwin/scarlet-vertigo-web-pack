import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';

export type CartProductDocument = CartProduct & Document;

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
export class CartProduct extends Document {
    @ApiProperty({ description: 'Cart id', type: String })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' })
    cartId: mongoose.Types.ObjectId;

    @ApiProperty({ description: 'Product', type: Product })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
    product: mongoose.Types.ObjectId | Product;

    @ApiProperty({ description: 'Quantity of product' })
    @Prop({ type: Number })
    quantity: number;

    @ApiProperty({ description: 'Price of product', type: String })
    @Prop({ type: mongoose.Types.Decimal128 })
    price: mongoose.Types.Decimal128;

    @ApiProperty({ description: 'Check status of product stock to define active or not', type: Boolean })
    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Message to user', default: '', type: String })
    @Prop({ type: String })
    message: string;
}

export const CartProductSchema = SchemaFactory.createForClass(CartProduct);
