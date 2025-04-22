import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { isAuthorized } from '../auth/decorators/isAuthorized.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @isAuthorized()
    @Post('/')
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Public()
    @Get('/')
    async getCategories() {
        return this.categoryService.getCategories();
    }

    @Public()
    @Get('/:id')
    async getSizeById(@Param('id') id: string) {
        return this.categoryService.getCategory(id);
    }

    @isAuthorized()
    @Put('/')
    async update(@Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(updateCategoryDto);
    }

    @isAuthorized()
    @Delete('/:id')
    async delete(@Param('id') id: string) {
        return this.categoryService.delete(id);
    }
}
