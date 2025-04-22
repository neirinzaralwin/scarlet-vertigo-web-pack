import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Query } from 'mongoose';
import { Cart, CartDocument } from './entities/cart.entity';
import { GetCartDto } from './dto/get-cart.dto';

export class CartRepository {
    constructor(@InjectModel(Cart.name) private readonly cartModel: Model<Cart>) {}

    private populate<T>(query: Query<T, any>) {
        return query.populate({
            path: 'products',
            populate: {
                path: 'product',
                model: 'Product',
                populate: [
                    {
                        path: 'images',
                        select: 'url',
                        model: 'ProductImage',
                    },
                    {
                        path: 'category',
                        select: 'name',
                        model: 'Category',
                    },
                    {
                        path: 'size',
                        select: 'name',
                        model: 'Size',
                    },
                ],
            },
            model: 'CartProduct',
        });
    }

    async findByUserId(userId: string, session?: mongoose.ClientSession): Promise<CartDocument> {
        try {
            const query = this.cartModel.findOne({ user: userId });

            if (session) {
                query.session(session);
            }

            const cart = await this.populate(query);

            if (!cart) throw new NotFoundException('Cart not found');

            return cart;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async find({ userId, getCartDto, session }: { userId: string; getCartDto?: GetCartDto; session?: mongoose.ClientSession }): Promise<CartDocument> {
        try {
            const searchQuery = {
                ...(getCartDto?.cartId && { _id: getCartDto.cartId }),
                ...(userId && { user: userId }),
            };

            const query = this.cartModel.findOne(searchQuery);

            if (session) {
                query.session(session);
            }

            const cart = await this.populate(query);

            if (!cart) throw new NotFoundException('Cart not found');

            return cart;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async create(cartData: Partial<Cart>, session?: mongoose.ClientSession): Promise<CartDocument> {
        try {
            const cart = new this.cartModel(cartData);

            if (session) {
                return await cart.save({ session });
            }

            return await cart.save();
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async update(id: string, cartData: Partial<Cart>, session?: mongoose.ClientSession): Promise<CartDocument> {
        try {
            const options = { new: true, ...(session && { session }) };
            const query = this.cartModel.findByIdAndUpdate(id, cartData, options);
            const cart = await this.populate(query);

            if (!cart) throw new NotFoundException('Cart not found');

            return cart;
        } catch (err) {
            console.error('Failed to update cart : ', err);
            throw new InternalServerErrorException(err);
        }
    }
}
