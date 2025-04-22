import { BadRequestException, Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartProductRepository } from './cart-product.repository';
import { Cart } from './entities/cart.entity';
import mongoose from 'mongoose';
import { GetCartDto } from './dto/get-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CartProduct } from './entities/cart-product.entity';

@Injectable()
export class CartService {
    constructor(
        private cartRepository: CartRepository,
        private cartProductRepository: CartProductRepository,
        private productService: ProductService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async create(userId: string) {
        return await this.cartRepository.create({ user: new mongoose.Types.ObjectId(userId), products: [] });
    }
    async addToCart(userId: string, addToCartDto: AddToCartDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const cart: Cart = await this.cartRepository.findByUserId(userId);

            const product: Product = await this.productService.getProduct({ id: addToCartDto.productId });

            this.checkProductAvailability(product, addToCartDto.quantity);

            const updatedCart = await this.addOrUpdateProductInCart(cart, product, addToCartDto, session);

            await session.commitTransaction();

            return updatedCart;
        } catch (error) {
            await session.abortTransaction();
            console.error('Add to cart failed, aborting transaction', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    findOne(userId: string, getCartDto: GetCartDto) {
        return this.cartRepository.find({ userId, getCartDto });
    }

    async remove(userId: string, cartProductId: string) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const cart: Cart = await this.cartRepository.findByUserId(userId);

            await this.cartProductRepository.delete(cartProductId, session);

            const updatedCart = await this.cartRepository.findByUserId(userId, session);

            const totalPrice = await this.calculateTotalPrice(updatedCart);

            const resultCart = await this.cartRepository.update(cart.id, { totalPrice }, session);

            await session.commitTransaction();

            return resultCart;
        } catch (err) {
            await session.abortTransaction();
            console.error('Remove from cart failed, aborting transaction', err);
            throw err;
        } finally {
            session.endSession();
        }
    }

    async removeAll(userId: string) {
        const cart: Cart = await this.cartRepository.findByUserId(userId);

        await this.cartProductRepository.deleteAll(cart.id);

        const updatedCart = await this.cartRepository.update(cart.id, { products: [], totalPrice: mongoose.Types.Decimal128.fromString('0') });

        return updatedCart;
    }

    // * Private methods

    private async checkProductAvailability(product: Product, newQuantity: number) {
        if (product.stock < newQuantity) {
            throw new Error('This product only has ' + product.stock + ' units available.');
        }
    }

    private async addOrUpdateProductInCart(cart: Cart, product: Product, dto: AddToCartDto, session?: mongoose.ClientSession): Promise<Cart> {
        let cartProduct = (cart.products as CartProduct[]).find((cp) => (cp.product.id as string) === (product.id as string));

        if (cartProduct) {
            let newQuantity: number;

            if (dto.isIncrement === 1) {
                newQuantity = cartProduct.quantity + dto.quantity;

                if (product.stock < newQuantity) {
                    throw new BadRequestException('This product only has ' + product.stock + ' units available.');
                }
            } else {
                if (dto.quantity > cartProduct.quantity) {
                    throw new BadRequestException('Quantity to subtract exceeds the current quantity in the cart.');
                }
                newQuantity = cartProduct.quantity - dto.quantity;
            }

            const newPrice = mongoose.Types.Decimal128.fromString((new Number(`${product.price}`).valueOf() * newQuantity).toString());

            await this.cartProductRepository.updateOne(
                { cartId: cart.id, productId: product.id },
                {
                    quantity: newQuantity,
                    price: newPrice,
                },
                session,
            );
        } else {
            if (dto.isIncrement === 0) throw new BadRequestException('Product not found in the cart.');

            if (product.stock < dto.quantity) {
                throw new BadRequestException('This product only has ' + product.stock + ' units available.');
            }

            cartProduct = await this.cartProductRepository.create(
                {
                    cartId: new mongoose.Types.ObjectId(cart.id as string),
                    product: new mongoose.Types.ObjectId(product.id as string),
                    quantity: dto.quantity,
                    price: mongoose.Types.Decimal128.fromString((new Number(`${product.price}`).valueOf() * dto.quantity).toString()),
                },
                session,
            );

            await this.cartRepository.update(cart.id, { products: [...cart.products, cartProduct.id] }, session);
        }

        const updatedCart = await this.cartRepository.findByUserId(cart.user.toString(), session);

        const totalPrice = await this.calculateTotalPrice(updatedCart);

        return await this.cartRepository.update(cart.id, { totalPrice }, session);
    }

    private async calculateTotalPrice(cart: Cart): Promise<mongoose.Types.Decimal128> {
        const cartProducts: CartProduct[] = cart.products as CartProduct[];

        let totalPrice = 0;

        if (cartProducts.length > 0) {
            totalPrice = cartProducts.reduce((acc, cartProduct) => {
                return acc + new Number(`${cartProduct.price}`).valueOf();
            }, 0);
        }

        return mongoose.Types.Decimal128.fromString(totalPrice.toString());
    }
}
