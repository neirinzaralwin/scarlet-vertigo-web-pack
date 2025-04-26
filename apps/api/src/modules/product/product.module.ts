import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { LocalFileStorageService } from '../../commons/services/local-file-storage/local-file-storage.service';
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
    providers: [ProductService, LocalFileStorageService, ProductImageService, ProductRepository, ProductImageRepository],
    exports: [ProductService],
})
export class ProductModule {}
