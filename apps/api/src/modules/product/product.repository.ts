import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';

export class ProductRepository {
    constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

    private populateFields(query: any) {
        return query
            .populate({
                path: 'images',
                select: 'url',
                model: 'ProductImage',
            })
            .populate({
                path: 'category',
                select: 'name',
                model: 'Category',
            })
            .populate({
                path: 'size',
                select: 'name',
                model: 'Size',
            });
    }

    async findAll(getAllProductsDto: GetAllProductsDto): Promise<{ products: ProductDocument[]; total: number }> {
        try {
            const products = await this.populateFields(this.productModel.find()).skip(getAllProductsDto.skip).limit(getAllProductsDto.limit).exec();

            const total = await this.productModel.countDocuments();

            return { products, total };
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async find({ id }: { id: string }): Promise<ProductDocument> {
        try {
            const product = await this.populateFields(this.productModel.findById(id)).exec();

            if (!product) throw new NotFoundException(`Product with ID ${id} not found`);

            return product;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async create(productData: Partial<Product>, session?: mongoose.ClientSession): Promise<ProductDocument> {
        try {
            const product = new this.productModel(productData);

            const savedProduct = session ? await product.save({ session }) : await product.save();

            const query = this.productModel.findById(savedProduct.id);
            if (session) query.session(session);

            return this.populateFields(query).exec();
        } catch (err) {
            console.error('Failed to create product: ', err);
            throw new InternalServerErrorException(err.message);
        }
    }

    async update(id: string, productData: Partial<Product>, session?: mongoose.ClientSession): Promise<ProductDocument> {
        try {
            const query = this.productModel.findByIdAndUpdate(id, productData, { new: true });
            if (session) query.session(session);

            const updatedProduct = await this.populateFields(query).exec();

            if (!updatedProduct) throw new NotFoundException(`Product with ID ${id} not found`);

            return updatedProduct;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async delete(id: string): Promise<ProductDocument> {
        try {
            const deletedProduct = await this.productModel.findByIdAndDelete(id);
            if (!deletedProduct) throw new NotFoundException(`Product with ID ${id} not found`);
            return deletedProduct;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
