import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from './entities/cart.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CartRepository } from './cart.repository';
import { CartProduct, CartProductSchema } from './entities/cart-product.entity';
import { CartProductRepository } from './cart-product.repository';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Cart.name, schema: CartSchema },
            { name: CartProduct.name, schema: CartProductSchema },
        ]),
        ProductModule,
    ],
    controllers: [CartController],
    providers: [CartService, CartRepository, CartProductRepository],
    exports: [CartService],
})
export class CartModule {}
