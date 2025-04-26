import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { ProductImageRepository } from './product-image.repository';
import { ProductImage, ProductImageDocument } from './entities/product-image.entity';
import { LocalFileStorageService } from 'src/commons/services/local-file-storage/local-file-storage.service';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { DeleteAllImagesDto } from './dtos/deleteAllImages.dto';
import mongoose from 'mongoose';

@Injectable()
export class ProductImageService {
    constructor(
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        private readonly productImageRepository: ProductImageRepository,
        private readonly localFileStorageService: LocalFileStorageService,
    ) {}

    async getAll({ id, productId }: { id?: string; productId?: string }) {
        return await this.productImageRepository.findAll({ id, productId });
    }

    async create(files: Array<Express.Multer.File>, session?: mongoose.ClientSession): Promise<ProductImageDocument[]> {
        const validationErrors = await Promise.all(
            files.map(async (file) => {
                return this.localFileStorageService.validateFile(file);
            }),
        );
        const firstValidationError = validationErrors.find((error) => error !== null);
        if (firstValidationError) {
            throw new BadRequestException(`Validation failed. ${firstValidationError}`);
        }

        const uploadPromises = files.map((file) => this.localFileStorageService.saveFile(file));
        const fileUploadResponses = await Promise.all(uploadPromises);

        const createProductImagePromises = fileUploadResponses.map((fileUploadResponse) => this.productImageRepository.create({ url: fileUploadResponse.filePath }, session));
        return (await Promise.all(createProductImagePromises)) as ProductImageDocument[];
    }

    async update(id: string, productImageData: Partial<ProductImage>, session?: mongoose.ClientSession) {
        return await this.productImageRepository.update(id, productImageData, session);
    }

    async delete(id: string): Promise<ProductImageDocument> {
        const deletedProductImage = await this.productImageRepository.delete(id);

        if (deletedProductImage && deletedProductImage.url) {
            try {
                await this.localFileStorageService.deleteFile(deletedProductImage.url);
            } catch (error) {
                console.error(`Failed to delete file from local storage: ${deletedProductImage.url}`, error);
            }
        }

        return deletedProductImage as ProductImageDocument;
    }

    async deleteAll(dto: DeleteAllImagesDto) {
        let product: Product | null = null;
        if (dto.productId) {
            product = await this.productService.getProduct({ id: dto.productId });
        }
        const imagesToDelete = product ? product.images : await this.getAll({});

        const deleteFilePromises = imagesToDelete.map(async (image) => {
            const imageUrl = typeof image === 'string' ? image : (image as ProductImage)?.url;
            if (imageUrl) {
                try {
                    await this.localFileStorageService.deleteFile(imageUrl);
                } catch (error) {
                    console.error(`Failed to delete file from local storage during deleteAll: ${imageUrl}`, error);
                }
            }
        });
        await Promise.all(deleteFilePromises);

        return await this.productImageRepository.deleteAll({ productId: dto.productId });
    }
}
