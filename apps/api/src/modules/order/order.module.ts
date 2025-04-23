import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.entity';
import { OrderProduct, OrderProductSchema } from './entities/order-product.entity';
import { OrderRepository } from './order.repository';
import { OrderProductRepository } from './order-product.repository';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: OrderProduct.name, schema: OrderProductSchema },
        ]),
        CartModule,
        ProductModule,
    ],
    controllers: [OrderController],
    providers: [OrderService, OrderRepository, OrderProductRepository],
})
export class OrderModule {}
