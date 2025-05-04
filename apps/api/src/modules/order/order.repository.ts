import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Query } from 'mongoose';
import { Order, OrderDocument } from './entities/order.entity';
import { GetOrderDto } from './dto/get-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';

export class OrderRepository {
    constructor(@InjectModel(Order.name) private readonly orderModel: Model<Order>) {}

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
            model: 'OrderProduct',
        });
    }

    async create(orderData: Partial<Order>, session?: mongoose.ClientSession): Promise<OrderDocument> {
        try {
            const order = new this.orderModel(orderData);

            if (session) {
                return await order.save({ session });
            }

            return await order.save();
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }
    async findAll(getOrdersDto: GetOrdersDto, session?: mongoose.ClientSession): Promise<{ orders: OrderDocument[]; total: number }> {
        try {
            const searchQuery: any = {};
            if (getOrdersDto.userId) {
                searchQuery.user = getOrdersDto.userId;
            }
            if (getOrdersDto.status) {
                searchQuery.status = getOrdersDto.status;
            }

            const query = this.orderModel.find(searchQuery);

            if (session) {
                query.session(session);
            }

            const orders = await this.populate(query).skip(getOrdersDto.skip).limit(getOrdersDto.limit).exec();

            const total = await this.orderModel.countDocuments(searchQuery);

            return { orders, total };
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async find({ userId, getOrderDto, session }: { userId?: string; getOrderDto?: GetOrderDto; session?: mongoose.ClientSession }): Promise<OrderDocument> {
        try {
            const searchQuery = {
                ...(getOrderDto?.orderId && { _id: getOrderDto.orderId }),
                ...(userId && { user: userId }),
            };

            const query = this.orderModel.findOne(searchQuery);

            if (session) {
                query.session(session);
            }

            const order = await this.populate(query);

            if (!order) throw new NotFoundException('Order not found');

            return order;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async update(id: string, orderData: Partial<Order>, session?: mongoose.ClientSession): Promise<OrderDocument> {
        try {
            const options = { new: true, ...(session && { session }) };

            const query = this.orderModel.findByIdAndUpdate(id, orderData, options);

            const order = await this.populate(query);

            if (!order) throw new NotFoundException('Order not found');

            return order;
        } catch (err) {
            console.error('Failed to update order : ', err);
            throw new InternalServerErrorException(err);
        }
    }

    async delete(id: string, session?: mongoose.ClientSession) {
        try {
            const deletedOrder = await this.orderModel.findByIdAndDelete(id);
            if (!deletedOrder) {
                throw new NotFoundException(`Order with ID ${id} not found`);
            }
            return {
                message: `Order with ID ${id} deleted successfully`,
            };
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
