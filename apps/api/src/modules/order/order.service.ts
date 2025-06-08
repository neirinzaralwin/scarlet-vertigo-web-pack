import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GetOrderDto } from './dto/get-order.dto';
import mongoose, { Connection, ClientSession, Types } from 'mongoose';
import { OrderRepository } from './order.repository';
import { InjectConnection } from '@nestjs/mongoose';
import { GetOrdersDto } from './dto/get-orders.dto';
import { Cart } from '../cart/entities/cart.entity';
import { CartService } from '../cart/cart.service';
import { GetCartDto } from '../cart/dto/get-cart.dto';
import { CartProduct } from '../cart/entities/cart-product.entity';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { OrderProductRepository } from './order-product.repository';
import { UpdateOrderDto } from './dto/update-order-dto';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { UpdateProductDto } from '../product/dtos/updateProduct.dto';

@Injectable()
export class OrderService {
    constructor(
        private orderRepository: OrderRepository,
        private orderProductRepository: OrderProductRepository,
        private cartService: CartService,
        private productService: ProductService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async create(userId: string) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const cart: Cart = await this.cartService.findOne(userId, {} as GetCartDto);

            const cartProducts = cart.products as CartProduct[];

            if (cartProducts.length === 0) throw new BadRequestException('Cart is empty');

            await this.checkStockAvailability(cartProducts);

            const currentOrder = await this.orderRepository.create(
                {
                    user: new mongoose.Types.ObjectId(userId),
                },
                session,
            );

            const orderProducts: OrderProduct[] = await this.createOrderProducts(cartProducts, currentOrder.id, session);

            if (orderProducts.length === 0) throw new NotFoundException('No products found for the order');

            await this.decreaseProductStock(orderProducts, session);

            const updatedOrder: Order = await this.orderRepository.update(
                currentOrder.id,
                {
                    products: orderProducts.map((op: OrderProduct) => op._id as Types.ObjectId),
                },
                session,
            );

            await this.cartService.removeAll(userId, session);

            await session.commitTransaction();

            const populatedOrder = await this.orderRepository.find({ getOrderDto: { orderId: updatedOrder.id } });

            return populatedOrder;
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

            await this.increaseProductStock(order.products as OrderProduct[], session);

            await this.deleteOrderProducts(order.products as OrderProduct[], session);

            await this.orderRepository.delete(order.id, session);

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

    private async deleteOrderProducts(orderProducts: OrderProduct[], session?: ClientSession): Promise<void> {
        await Promise.all(
            orderProducts.map(async (orderProduct) => {
                await this.orderProductRepository.delete(orderProduct.id, session);
            }),
        );
    }

    private async decreaseProductStock(orderProducts: OrderProduct[], session: ClientSession): Promise<void> {
        for (const orderProduct of orderProducts) {
            const product = await this.productService.getProduct({ id: (orderProduct.product as Product).id });
            const newStock = product.stock - orderProduct.quantity;
            if (newStock < 0) {
                throw new BadRequestException(`Insufficient stock for product ${product.name}.`);
            }
            await this.productService.updateProduct(product.id, { stock: newStock } as UpdateProductDto, { session });
        }
    }

    private async increaseProductStock(orderProducts: OrderProduct[], session: ClientSession): Promise<void> {
        for (const orderProduct of orderProducts) {
            const product = await this.productService.getProduct({ id: (orderProduct.product as Product).id });
            const newStock = product.stock + orderProduct.quantity;
            await this.productService.updateProduct(product.id, { stock: newStock } as UpdateProductDto, { session });
        }
    }

    private async checkStockAvailability(cartProducts: CartProduct[]) {
        for (const cartProduct of cartProducts) {
            const product = cartProduct.product as Product;
            if (product.stock < cartProduct.quantity) {
                throw new BadRequestException(`Product ${product.name} only has ${product.stock} units available.`);
            }
        }
    }
}
