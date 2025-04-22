import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { OrderProduct, OrderProductDocument } from './entities/order-product.entity';

export class OrderProductRepository {
    constructor(@InjectModel(OrderProduct.name) private readonly orderProductModel: Model<OrderProduct>) {}

    private async populateProduct(orderProduct: OrderProductDocument): Promise<OrderProductDocument> {
        return await orderProduct.populate({
            path: 'product',
            populate: {
                path: 'images',
                select: 'url',
                model: 'ProductImage',
            },
            model: 'Product',
        });
    }

    async create(orderProductData: Partial<OrderProduct>, session?: mongoose.ClientSession): Promise<OrderProductDocument> {
        const orderProduct = new this.orderProductModel(orderProductData);

        try {
            const saveOptions = session ? { session } : undefined;

            const savedOrderProduct = await orderProduct.save(saveOptions);

            return await this.populateProduct(savedOrderProduct);
        } catch (error) {
            if (session) session.abortTransaction();
            throw new InternalServerErrorException(error);
        }
    }

    async find({ orderId }: { orderId: string }): Promise<OrderProductDocument[]> {
        try {
            const orderProducts = await this.orderProductModel.find({ orderId });

            return await Promise.all(orderProducts.map(async (orderProduct) => await this.populateProduct(orderProduct)));
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async findOne({ orderId, productId }: { orderId?: string; productId?: string }): Promise<OrderProductDocument | null> {
        const searchQuery = {
            ...(orderId && { orderId }),
            ...(productId && { productId }),
        };

        const orderProduct = await this.orderProductModel.findOne(searchQuery);

        return orderProduct ? await this.populateProduct(orderProduct) : null;
    }

    async updateOne({ orderId, productId }: { orderId?: string; productId?: string }, cartProductData: Partial<OrderProduct>, session?: mongoose.ClientSession): Promise<OrderProductDocument> {
        const searchQuery = {
            ...(orderId && { orderId }),
            ...(productId && { product: productId }),
        };

        try {
            const options: mongoose.QueryOptions = { new: true };
            if (session) options.session = session;

            const updatedCartProduct = await this.orderProductModel.findOneAndUpdate(searchQuery, cartProductData, options);

            if (!updatedCartProduct) throw new Error('CartProduct not found');

            return await this.populateProduct(updatedCartProduct);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async delete(orderId: string, session?: mongoose.ClientSession): Promise<OrderProductDocument> {
        try {
            const options = session ? { session } : undefined;

            const result = await this.orderProductModel.findByIdAndDelete(orderId, options);

            if (!result) throw new Error('CartProduct not found');

            return result;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async deleteAll(orderId: string) {
        try {
            await this.orderProductModel.deleteMany({ orderId });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
