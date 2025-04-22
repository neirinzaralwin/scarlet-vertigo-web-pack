import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { GoogleDriveService } from '../../commons/services/google-drive-service/google-drive.service';
import { ProductImageRepository } from './product-image.repository';
import { ProductImage, ProductImageSchema } from './entities/product-image.entity';
import { ProductImageService } from './product-image.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
            { name: ProductImage.name, schema: ProductImageSchema },
        ]),
    ],
    controllers: [ProductController],
    providers: [ProductService, GoogleDriveService, ProductImageService, ProductRepository, ProductImageRepository],
    exports: [ProductService],
})
export class ProductModule {}
