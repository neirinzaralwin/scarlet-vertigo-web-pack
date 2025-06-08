import { Body, Controller, Delete, Get, Post, Put, Query, UploadedFiles, UseInterceptors, Param, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { GetAllProductsDto } from './dtos/getAllProducts.dto';
import { Public } from '../auth/decorators/public.decorator';
import { isAuthorized } from '../auth/decorators/isAuthorized.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dtos/createProduct.dto';
import { UpdateProductDto } from './dtos/updateProduct.dto';
import { DeleteImageDto } from './dtos/deleteImage.dto';
import { DeleteAllImagesDto } from './dtos/deleteAllImages.dto';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Public()
    @Get('/')
    async findAll(@Query() getAllProductsDto: GetAllProductsDto) {
        return this.productService.getProducts(getAllProductsDto);
    }

    @Public()
    @Get('/:id')
    async findOne(@Param('id') id: string) {
        return this.productService.getProduct({ id });
    }

    @isAuthorized()
    @Post('/')
    @UseInterceptors(FilesInterceptor('files'))
    async createProduct(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createProductDto: CreateProductDto) {
        return this.productService.createProduct(createProductDto, files);
    }

    @isAuthorized()
    @Put('/:id')
    async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.updateProduct(id, updateProductDto);
    }

    @isAuthorized()
    @Delete('/:id')
    async deleteProduct(@Param('id') id: string) {
        return this.productService.deleteProduct(id);
    }

    @isAuthorized()
    @Post('/upload-image')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadProductImage(@Query('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>) {
        return this.productService.uploadProductImage(id, files);
    }

    @isAuthorized()
    @Delete('/delete-image')
    async deleteProductImage(@Query('id') id: string, @Body() deleteImageDto: DeleteImageDto) {
        return this.productService.deleteProductImage(id, deleteImageDto);
    }

    @isAuthorized()
    @Delete('/delete-all-images')
    async deleteAllProductImages(@Query() query: DeleteAllImagesDto) {
        return this.productService.deleteAllProductImages(query);
    }
}
