import { InjectModel } from '@nestjs/mongoose';
import { ProductImage, ProductImageDocument } from './entities/product-image.entity';
import mongoose, { Model } from 'mongoose';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

export class ProductImageRepository {
    constructor(@InjectModel(ProductImage.name) private readonly productImageModel: Model<ProductImage>) {}

    async findAll({ id, productId }: { id?: string; productId?: string }): Promise<ProductImageDocument[]> {
        try {
            const query: any = {};

            if (id) query._id = id;
            if (productId) query.productId = productId;

            return await this.productImageModel.find(query);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async create(productImageData: Partial<ProductImage>, session?: mongoose.ClientSession): Promise<ProductImageDocument> {
        try {
            const options = session ? { session } : undefined;
            return await new this.productImageModel(productImageData).save(options);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async update(id: string, productImageData: Partial<ProductImage>, session?: mongoose.ClientSession): Promise<ProductImageDocument> {
        try {
            const options = session ? { new: true, session } : { new: true };
            const updatedProductImage = await this.productImageModel.findByIdAndUpdate(id, productImageData, options);
            if (!updatedProductImage) {
                throw new NotFoundException(`Product Image with ID ${id} not found`);
            }
            return updatedProductImage;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async delete(id: string, session?: mongoose.ClientSession): Promise<ProductImageDocument> {
        try {
            const options = session ? { session } : undefined;
            const image = await this.productImageModel.findByIdAndDelete(id, options);
            if (!image) {
                throw new NotFoundException(`Product Image with ID ${id} not found`);
            }
            return image;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async deleteAll({ productId }: { productId?: string } = {}) {
        try {
            const query: any = {};

            if (productId) query.productId = productId;

            return await this.productImageModel.deleteMany(query);
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
