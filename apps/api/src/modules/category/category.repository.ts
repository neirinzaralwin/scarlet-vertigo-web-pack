import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

export class CategoryRepository {
    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {}

    async create({ name }): Promise<CategoryDocument> {
        try {
            const size = new this.categoryModel({ name });
            return await size.save();
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async findAll(): Promise<CategoryDocument[]> {
        try {
            return await this.categoryModel.find();
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async findById(id: string): Promise<CategoryDocument> {
        try {
            const size = await this.categoryModel.findById(id);
            if (!size) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }
            return size;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async update(updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
        try {
            const size = await this.categoryModel.findByIdAndUpdate(updateCategoryDto.id, { ...updateCategoryDto }, { new: true });
            if (!size) {
                throw new NotFoundException(`Category with ID ${updateCategoryDto.id} not found`);
            }
            return size;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async delete(id: string) {
        try {
            const deletedCategory = await this.categoryModel.findByIdAndDelete(id);
            if (!deletedCategory) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }
            return {
                message: `Category with ID ${id} deleted successfully`,
            };
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
