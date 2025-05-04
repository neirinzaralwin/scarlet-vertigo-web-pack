import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GetOrderDto } from './dto/get-order.dto';
import mongoose, { Connection, ClientSession, Types, ObjectId } from 'mongoose';
import { OrderRepository } from './order.repository';
import { InjectConnection } from '@nestjs/mongoose';
import { GetOrdersDto } from './dto/get-orders.dto';
import { CartRepository } from '../cart/cart.repository';
import { Cart } from '../cart/entities/cart.entity';
import { CartService } from '../cart/cart.service';
import { GetCartDto } from '../cart/dto/get-cart.dto';
import { CartProduct } from '../cart/entities/cart-product.entity';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { OrderProductRepository } from './order-product.repository';
import { UpdateOrderDto } from './dto/update-order-dto';

@Injectable()
export class OrderService {
    constructor(
        private orderRepository: OrderRepository,
        private orderProductRepository: OrderProductRepository,
        private cartService: CartService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async create(userId: string) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const cart: Cart = await this.cartService.findOne(userId, {} as GetCartDto);

            const cartProducts = cart.products as CartProduct[];

            if (cartProducts.length === 0) throw new BadRequestException('Cart is empty');

            const currentOrder = await this.orderRepository.create(
                {
                    user: new mongoose.Types.ObjectId(userId),
                },
                session,
            );

            const orderProducts: OrderProduct[] = await this.createOrderProducts(cartProducts, currentOrder.id, session);

            if (orderProducts.length === 0) throw new NotFoundException('No products found for the order');

            const updatedOrder: Order = await this.orderRepository.update(
                currentOrder.id,
                {
                    products: orderProducts.map((op: OrderProduct) => op._id as Types.ObjectId),
                },
                session,
            );

            await this.cartService.removeAll(userId, session);

            await session.commitTransaction();

            return updatedOrder;
        } catch (err) {
            await session.abortTransaction();
            console.error('Create order failed, aborting transaction', err);
            throw err;
        } finally {
            session.endSession();
        }
    }

    async findAll(userId: string, getOrdersDto: GetOrdersDto) {
        const finalGetOrdersDto: GetOrdersDto = {
            ...getOrdersDto,
            userId: getOrdersDto.userId ?? userId,
        };
        return await this.orderRepository.findAll(finalGetOrdersDto);
    }

    findOne(userId: string, getOrderDto: GetOrderDto) {
        return this.orderRepository.find({ userId, getOrderDto });
    }

    async update(updateOrderDto: UpdateOrderDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const order = await this.orderRepository.find({
                getOrderDto: { orderId: updateOrderDto.orderId },
                session,
            });

            if (!order) throw new NotFoundException('Order not found');

            const updatedOrder = await this.orderRepository.update(updateOrderDto.orderId, updateOrderDto, session);

            await session.commitTransaction();

            return {
                message: 'Order updated successfully',
                order: updatedOrder,
            };
        } catch (err) {
            await session.abortTransaction();
            console.error('Update order failed, aborting transaction', err);
            throw err;
        } finally {
            session.endSession();
        }
    }

    async remove(id: string) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const order: Order = await this.orderRepository.find({
                getOrderDto: { orderId: id },
                session,
            });

            if (!order) throw new NotFoundException('Order not found');

            await session.commitTransaction();

            return {
                message: 'Order deleted successfully',
            };
        } catch (err) {
            await session.abortTransaction();
            console.error('Update order failed, aborting transaction', err);
            throw err;
        } finally {
            session.endSession();
        }
    }

    // * Private methods

    private async createOrderProducts(cartProducts: CartProduct[], orderId: string, session?: ClientSession): Promise<OrderProduct[]> {
        return await Promise.all(
            cartProducts.map(async (cartProduct) =>
                this.orderProductRepository.create(
                    { orderId: new mongoose.Types.ObjectId(orderId), product: new mongoose.Types.ObjectId(cartProduct.product.id), quantity: cartProduct.quantity, price: cartProduct.price },
                    session,
                ),
            ),
        );
    }
}
