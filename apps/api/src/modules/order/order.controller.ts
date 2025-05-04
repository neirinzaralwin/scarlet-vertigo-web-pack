import { Controller, Post, Body, Request, Query, Get, Delete, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtPayload } from '../auth/interfaces/jwtPayload.interface';
import { GetOrderDto } from './dto/get-order.dto';
import { Public } from '../auth/decorators/public.decorator';
import { isAuthorized } from '../auth/decorators/isAuthorized.decorator';
import { UpdateOrderDto } from './dto/update-order-dto';
import { GetOrdersDto } from './dto/get-orders.dto';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    create(@Request() req: { user: JwtPayload }) {
        return this.orderService.create(req.user.sub);
    }

    @Get()
    findAll(@Request() req: { user: JwtPayload }, @Query() getOrdersDto: GetOrdersDto) {
        return this.orderService.findAll(req.user.sub, getOrdersDto);
    }

    @Get('/detail')
    findOne(@Request() req: { user: JwtPayload }, @Body() getOrderDto: GetOrderDto) {
        return this.orderService.findOne(req.user.sub, getOrderDto);
    }

    @isAuthorized()
    @Put()
    update(@Request() req: { user: JwtPayload }, @Body() updateOrderDto: UpdateOrderDto) {
        return this.orderService.update(updateOrderDto);
    }

    @isAuthorized()
    @Delete()
    remove(@Request() req: { user: JwtPayload }, @Query('id') id: string) {
        return this.orderService.remove(id);
    }
}
