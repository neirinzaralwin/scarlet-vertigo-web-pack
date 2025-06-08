import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';
import { Product } from './entities/product.entity';
import mongoose, { ClientSession, Connection } from 'mongoose';
import { CreateProductDto } from './dtos/createProduct.dto';
import { ProductImage } from './entities/product-image.entity';
import { ProductImageService } from './product-image.service';
import { UpdateProductDto } from './dtos/updateProduct.dto';
import { DeleteImageDto } from './dtos/deleteImage.dto';
import { DeleteAllImagesDto } from './dtos/deleteAllImages.dto';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class ProductService {
    constructor(
        private productRepository: ProductRepository,
        private productImageService: ProductImageService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async getProducts(getAllProductDto: GetAllProductsDto): Promise<{ products: Product[]; total: number }> {
        return await this.productRepository.findAll(getAllProductDto);
    }

    async getProduct({ id }: { id: string }) {
        return await this.productRepository.find({ id });
    }

    async createProduct(createProductDto: CreateProductDto, files: Array<Express.Multer.File>) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const productImages: ProductImage[] = await this.productImageService.create(files, session);

            const productData = this.transformCreateProduct(createProductDto);

            const createdProduct = await this.productRepository.create(
                {
                    ...productData,
                    images: productImages.map((image: ProductImage) => new mongoose.Types.ObjectId(image.id as string)),
                },
                session,
            );

            const updateImagePromises = productImages.map((image) => {
                if (!createdProduct || !createdProduct.id) {
                    throw new BadRequestException('Failed to create product');
                }
                image.productId = createdProduct.id;
                return this.productImageService.update(image.id, image, session);
            });

            await Promise.all(updateImagePromises);

            await session.commitTransaction();

            return createdProduct;
        } catch (err) {
            await session.abortTransaction();
            console.error('Failed to create product, aborted transaction', err);
            throw new BadRequestException(err.message);
        } finally {
            session.endSession();
        }
    }

    async deleteProduct(id: string) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const productImages = await this.productImageService.getAll({ productId: id });

            const deletedProduct = await this.productRepository.delete(id, session);

            const deleteProductImagePromises = productImages.map((image) => {
                return this.productImageService.delete(image.id, session);
            });

            await Promise.all(deleteProductImagePromises);
            await session.commitTransaction();
            return {
                message: `Product with ID ${deletedProduct.id} has been deleted`,
            };
        } catch (err) {
            await session.abortTransaction();
            console.error('Failed to delete product, aborted transaction', err);
            throw new BadRequestException(err.message);
        } finally {
            session.endSession();
        }
    }

    async updateProduct(id: string, dto: UpdateProductDto, { files, session }: { files?: Array<Express.Multer.File>; session?: ClientSession } = {}) {
        let localSession = session;
        let shouldEndSession = false;

        if (!localSession) {
            localSession = await this.connection.startSession();
            localSession.startTransaction();
            shouldEndSession = true;
        }

        try {
            // Get current product first
            const currentProduct = await this.productRepository.find({ id });

            // Handle image deletions first
            let updatedImageIds = currentProduct.images as mongoose.Types.ObjectId[];
            if (dto.deletedImageIds && dto.deletedImageIds.length > 0) {
                const imageIdsArray = typeof dto.deletedImageIds === 'string' ? dto.deletedImageIds.split(',').map((id) => id.trim()) : dto.deletedImageIds;

                // Delete the images from the database
                const deletePromises = imageIdsArray.map((imageId) => this.productImageService.delete(imageId, localSession));
                await Promise.all(deletePromises);

                // Remove deleted images from product's images array
                updatedImageIds = updatedImageIds.filter((imgId) => !imageIdsArray.includes(imgId.toString()));
            }

            // Handle new image uploads
            let newImages: ProductImage[] = [];
            if (files && files.length > 0) {
                newImages = await this.productImageService.create(files, localSession);

                // Update new images with product ID
                const updateImagePromises = newImages.map((image) => {
                    image.productId = new mongoose.Types.ObjectId(id);
                    return this.productImageService.update(image.id, image, localSession);
                });
                await Promise.all(updateImagePromises);
            }

            // Add new images to product's images array
            if (newImages.length > 0) {
                const newImageIds = newImages.map((img) => new mongoose.Types.ObjectId(img.id as string));
                updatedImageIds = [...updatedImageIds, ...newImageIds];
            }

            // Transform product data
            const product = this.transformCreateProduct(dto);

            // Include updated images array
            const productUpdateData = {
                ...product,
                images: updatedImageIds,
            };

            const updatedProduct = await this.productRepository.update(id, productUpdateData, localSession);

            if (shouldEndSession) {
                await localSession.commitTransaction();
            }

            return { message: 'Product updated successfully', product: updatedProduct };
        } catch (err) {
            if (shouldEndSession) {
                await localSession.abortTransaction();
            }
            console.error('Failed to update product', err);
            throw new BadRequestException(err.message);
        } finally {
            if (shouldEndSession) {
                localSession.endSession();
            }
        }
    }

    async uploadProductImage(id: string, files: Array<Express.Multer.File>) {
        const product = await this.productRepository.find({ id });

        const productImages: ProductImage[] = await this.productImageService.create(files);

        const updateProductImagePromises = productImages.map((image) => {
            image.productId = product.id;
            return this.productImageService.update(image.id, image);
        });

        await Promise.all(updateProductImagePromises);

        // Append the new images to the product's images field
        const newImageIds = productImages.map((image) => image._id as mongoose.Types.ObjectId);
        product.images = [...((product.images as mongoose.Types.ObjectId[]) || []), ...newImageIds];

        const updatedProduct = await this.productRepository.update(id, product);

        return { message: 'Product image uploaded to the product' };
    }

    async deleteProductImage(id: string, deleteImageDto: DeleteImageDto) {
        const image: ProductImage = await this.productImageService.delete(deleteImageDto.imageId);

        const product: Product = await this.productRepository.find({ id: image.productId.toString() });

        // Remove the deleted image from the product's images array
        product.images = (product.images as mongoose.Types.ObjectId[]).filter((imgId) => imgId.toString() !== deleteImageDto.imageId);

        // Update the product with the new images array
        const updatedProduct: Product = await this.productRepository.update(product.id, product);

        return { message: 'Product image deleted successfully', product: updatedProduct };
    }

    async deleteAllProductImages(dto: DeleteAllImagesDto) {
        await this.productImageService.deleteAll(dto);

        const product: Product = await this.productRepository.find({ id: dto.productId.toString() });

        // clear product images
        product.images = [];

        const updatedProduct = await this.productRepository.update(dto.productId, product);

        return { message: 'All images deleted successfully', product: updatedProduct };
    }

    // * PRIVATE METHODS

    private transformCreateProduct(dto: CreateProductDto | UpdateProductDto): Partial<Product> {
        return {
            ...dto,
            price: dto.price ? new mongoose.Types.Decimal128(dto.price.toString()) : undefined,
            category: dto.categoryId ? new mongoose.Types.ObjectId(dto.categoryId.toString()) : undefined,
            size: dto.sizeId ? new mongoose.Types.ObjectId(dto.sizeId.toString()) : undefined,
        };
    }
}
