import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { USER_ROLE } from '../../../commons/constants/userRoles';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from 'src/modules/cart/entities/cart.entity';

export type UserDocument = User & Document;

@Schema({
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        },
    },
})
export class User extends Document {
    @ApiProperty({ description: "User's name" })
    @Prop({ type: String })
    name: string;

    @ApiProperty({ description: "User's email" })
    @Prop({ type: String })
    email: string;

    @ApiProperty({ description: "User's password" })
    @Prop({ type: String })
    password: string;

    @ApiProperty({
        description: "User's role",
        enum: Object.values(USER_ROLE),
        default: USER_ROLE.customer,
        required: false,
    })
    @Prop({
        type: String,
        enum: Object.values(USER_ROLE),
        default: USER_ROLE.customer,
    })
    role: keyof typeof USER_ROLE;

    @ApiProperty({ description: 'Created time', required: false, default: Date.now })
    @Prop({ type: Date, default: Date.now })
    createdAt?: Date;

    @ApiProperty({ description: 'Updated time', required: false })
    @Prop({ type: Date, default: Date.now })
    updatedAt?: Date;

    @ApiProperty({ description: "User's shopping cart", type: Cart, required: false })
    @Prop({ type: mongoose.Types.ObjectId, ref: 'Cart', default: null })
    cart?: mongoose.Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
