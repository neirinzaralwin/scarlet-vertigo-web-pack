import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { CartProduct } from './cart-product.entity';

export type CartDocument = Cart & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            ret.totalPrice = ret.totalPrice.toString();
        },
    },
})
export class Cart extends Document {
    @ApiProperty({ description: "User's id or info", type: String })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: mongoose.Types.ObjectId;

    @ApiProperty({ description: 'Total price', type: String })
    @Prop({ type: mongoose.Types.Decimal128, default: 0 })
    totalPrice: mongoose.Types.Decimal128;

    @ApiProperty({ description: 'Created time' })
    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @ApiProperty({ description: 'Updated time' })
    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

    @ApiProperty({ description: 'List of cart products', type: [CartProduct] })
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartProduct' }] })
    products: mongoose.Types.ObjectId[] | CartProduct[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
