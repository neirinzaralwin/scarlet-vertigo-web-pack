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

    /**
     * Helper method to convert relative URLs to full URLs
     * Useful for existing images that might have relative URLs stored
     */
    private convertToFullUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return this.localFileStorageService.getFileUrl(url);
    }

    async getAll({ id, productId }: { id?: string; productId?: string }) {
        const images = await this.productImageRepository.findAll({ id, productId });
        // Convert relative URLs to full URLs for response and ensure id property exists
        return images.map((image) => {
            const imageObj = image.toObject();
            return {
                ...imageObj,
                id: imageObj.id || imageObj._id?.toString(),
                url: this.convertToFullUrl(image.url),
            };
        });
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

        const createProductImagePromises = fileUploadResponses.map((fileUploadResponse) => {
            // Convert relative path to full URL for storage
            const fullUrl = this.localFileStorageService.getFileUrl(fileUploadResponse.filePath);
            return this.productImageRepository.create({ url: fullUrl }, session);
        });
        return (await Promise.all(createProductImagePromises)) as ProductImageDocument[];
    }

    async update(id: string, productImageData: Partial<ProductImage>, session?: mongoose.ClientSession) {
        return await this.productImageRepository.update(id, productImageData, session);
    }

    async delete(id: string, session?: mongoose.ClientSession): Promise<ProductImageDocument> {
        const deletedProductImage = await this.productImageRepository.delete(id, session);

        if (deletedProductImage && deletedProductImage.url) {
            try {
                const urlToDelete = deletedProductImage.url.startsWith('http') ? new URL(deletedProductImage.url).pathname : deletedProductImage.url;
                await this.localFileStorageService.deleteFile(urlToDelete);
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
                    // Extract the relative path from the full URL if needed
                    const urlToDelete = imageUrl.startsWith('http') ? new URL(imageUrl).pathname : imageUrl;
                    await this.localFileStorageService.deleteFile(urlToDelete);
                } catch (error) {
                    console.error(`Failed to delete file from local storage during deleteAll: ${imageUrl}`, error);
                }
            }
        });
        await Promise.all(deleteFilePromises);

        return await this.productImageRepository.deleteAll({ productId: dto.productId });
    }
}
