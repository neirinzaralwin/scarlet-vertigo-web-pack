import { Controller, Post, Body, Request, Query, Get, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtPayload } from '../auth/interfaces/jwtPayload.interface';
import { GetOrderDto } from './dto/get-order.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    create(@Request() req: { user: JwtPayload }) {
        return this.orderService.create(req.user.sub);
    }

    @Get()
    findAll(@Request() req: { user: JwtPayload }) {
        return this.orderService.findAll(req.user.sub);
    }

    @Get('/detail')
    findOne(@Request() req: { user: JwtPayload }, @Query() getOrderDto: GetOrderDto) {
        return this.orderService.findOne(req.user.sub, getOrderDto);
    }
}
