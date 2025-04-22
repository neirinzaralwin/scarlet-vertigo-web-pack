import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { ORDER_STATUS } from 'src/commons/constants/orderStatus';
import { OrderProduct } from './order-product.entity';

export type OrderDocument = Order & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
})
export class Order extends Document {
    @ApiProperty({ description: "User's id or info", type: String })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: mongoose.Types.ObjectId;

    @ApiProperty({
        description: 'Order Status',
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.processing,
        required: false,
    })
    @Prop({
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.processing,
    })
    status: keyof typeof ORDER_STATUS;

    @ApiProperty({ description: 'Created time' })
    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @ApiProperty({ description: 'Updated time' })
    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

    @ApiProperty({ description: 'List of order products', type: [OrderProduct] })
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderProduct' }] })
    products: mongoose.Types.ObjectId[] | OrderProduct[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
