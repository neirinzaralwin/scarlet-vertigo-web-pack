import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { ProductImageRepository } from './product-image.repository';
import { ProductImage, ProductImageDocument } from './entities/product-image.entity';
import { GoogleDriveService } from 'src/commons/services/google-drive-service/google-drive.service';
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
        private readonly googleDriveService: GoogleDriveService,
    ) {}

    async getAll({ id, productId }: { id?: string; productId?: string }) {
        return await this.productImageRepository.findAll({ id, productId });
    }

    async create(files: Array<Express.Multer.File>, session?: mongoose.ClientSession) {
        const validationErrors = await Promise.all(
            files.map(async (file) => {
                return this.googleDriveService.validateFile(file);
            }),
        );
        const firstValidationError = validationErrors.find((error) => error !== null);
        if (firstValidationError) {
            throw new BadRequestException(`Validation failed. ${firstValidationError}`);
        }

        const uploadPromises = files.map((file) => this.googleDriveService.uploadFile(file, `${process.env.DRIVE_FOLDER_ID}`));
        const fileUploadResponses = await Promise.all(uploadPromises);

        const createProductImagePromises = fileUploadResponses.map((fileUploadResponse) => this.productImageRepository.create({ url: fileUploadResponse.webViewLink }, session));
        return await Promise.all(createProductImagePromises);
    }

    async update(id: string, productImageData: Partial<ProductImage>, session?: mongoose.ClientSession) {
        return await this.productImageRepository.update(id, productImageData, session);
    }

    async delete(id: string) {
        const deletedProductImage = await this.productImageRepository.delete(id);

        const match = deletedProductImage.url.match(/\/d\/([^/?]+)/);
        if (match && match[1]) {
            await this.googleDriveService.deleteFile(match[1]);
        }

        return deletedProductImage;
    }

    async deleteAll(dto: DeleteAllImagesDto) {
        if (dto.productId) {
            const product: Product = await this.productService.getProduct({ id: dto.productId });
            product.images.map((image) => {
                const match = image.url.match(/\/d\/([^/?]+)/);
                if (match && match[1]) {
                    this.googleDriveService.deleteFile(match[1]);
                }
            });
        }

        return await this.productImageRepository.deleteAll({ productId: dto.productId });
    }
}
