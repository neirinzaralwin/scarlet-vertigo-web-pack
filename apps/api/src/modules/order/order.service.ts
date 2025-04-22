import { Injectable } from '@nestjs/common';
import { GetOrderDto } from './dto/get-order.dto';
import { Connection } from 'mongoose';
import { OrderRepository } from './order.repository';
import { InjectConnection } from '@nestjs/mongoose';
import { GetOrdersDto } from './dto/get-orders.dto';

@Injectable()
export class OrderService {
    constructor(
        private orderRepository: OrderRepository,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    create(userId: string) {
        return 'This action adds a new order';
    }

    async findAll(userId: string) {
        return await this.orderRepository.findAll({ userId });
    }

    findOne(userId: string, getOrderDto: GetOrderDto) {
        return this.orderRepository.find({ userId, getOrderDto });
    }

    remove(id: number) {
        return `This action removes a #${id} order`;
    }
}
