import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CartProduct, CartProductDocument } from './entities/cart-product.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class CartProductRepository {
    constructor(@InjectModel(CartProduct.name) private readonly cartProductModel: Model<CartProduct>) {}

    private async populateProduct(cartProduct: CartProductDocument): Promise<CartProductDocument> {
        return await cartProduct.populate({
            path: 'product',
            populate: {
                path: 'images',
                select: 'url',
                model: 'ProductImage',
            },
            model: 'Product',
        });
    }

    async create(cartProductData: Partial<CartProduct>, session?: mongoose.ClientSession): Promise<CartProductDocument> {
        const cartProduct = new this.cartProductModel(cartProductData);

        try {
            const saveOptions = session ? { session } : undefined;

            const savedCartProduct = await cartProduct.save(saveOptions);

            return await this.populateProduct(savedCartProduct);
        } catch (error) {
            if (session) session.abortTransaction();
            throw new InternalServerErrorException(error);
        }
    }

    async find({ cartId }: { cartId: string }): Promise<CartProductDocument[]> {
        try {
            const cartProducts = await this.cartProductModel.find({ cartId });

            return await Promise.all(cartProducts.map(async (cartProduct) => await this.populateProduct(cartProduct)));
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async findOne({ cartId, productId }: { cartId?: string; productId?: string }): Promise<CartProductDocument | null> {
        const searchQuery = {
            ...(cartId && { cartId }),
            ...(productId && { productId }),
        };

        const cartProduct = await this.cartProductModel.findOne(searchQuery);

        return cartProduct ? await this.populateProduct(cartProduct) : null;
    }

    async updateOne({ cartId, productId }: { cartId?: string; productId?: string }, cartProductData: Partial<CartProduct>, session?: mongoose.ClientSession): Promise<CartProductDocument> {
        const searchQuery = {
            ...(cartId && { cartId }),
            ...(productId && { product: productId }),
        };

        try {
            const options: mongoose.QueryOptions = { new: true };
            if (session) options.session = session;

            const updatedCartProduct = await this.cartProductModel.findOneAndUpdate(searchQuery, cartProductData, options);

            if (!updatedCartProduct) throw new Error('CartProduct not found');

            return await this.populateProduct(updatedCartProduct);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async delete(cartId: string, session?: mongoose.ClientSession): Promise<CartProductDocument> {
        try {
            const options = session ? { session } : undefined;

            const result = await this.cartProductModel.findByIdAndDelete(cartId, options);

            if (!result) throw new Error('CartProduct not found');

            return result;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async deleteAll(cartId: string) {
        try {
            await this.cartProductModel.deleteMany({ cartId });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
