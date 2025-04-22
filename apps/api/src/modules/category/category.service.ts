import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async create(createCategoryDto: CreateCategoryDto) {
        return await this.categoryRepository.create(createCategoryDto);
    }

    async getCategories() {
        return await this.categoryRepository.findAll();
    }

    async getCategory(id: string) {
        return await this.categoryRepository.findById(id);
    }

    async update(updateCategoryDto: UpdateCategoryDto) {
        return await this.categoryRepository.update(updateCategoryDto);
    }

    async delete(id: string) {
        return await this.categoryRepository.delete(id);
    }
}
