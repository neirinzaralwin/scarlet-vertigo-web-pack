import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Size, SizeDocument } from './entities/size.entity';
import { UpdateSizeDto } from './dtos/updateSize.dto';

export class SizeRepository {
    constructor(@InjectModel(Size.name) private readonly sizeModel: Model<Size>) {}

    async create(name: string): Promise<SizeDocument> {
        try {
            const size = new this.sizeModel({ name });
            return await size.save();
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async findAll(): Promise<SizeDocument[]> {
        try {
            return await this.sizeModel.find();
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async findById(id: string): Promise<SizeDocument> {
        try {
            const size = await this.sizeModel.findById(id);
            if (!size) {
                throw new NotFoundException(`Size with ID ${id} not found`);
            }
            return size;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async update(updateSizeDto: UpdateSizeDto): Promise<SizeDocument> {
        try {
            const size = await this.sizeModel.findByIdAndUpdate(updateSizeDto.id, { ...updateSizeDto }, { new: true });
            if (!size) {
                throw new NotFoundException(`Size with ID ${updateSizeDto.id} not found`);
            }
            return size;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async delete(id: string) {
        try {
            const deletedSize = await this.sizeModel.findByIdAndDelete(id);
            if (!deletedSize) {
                throw new NotFoundException(`Size with ID ${id} not found`);
            }
            return {
                message: `Size with ID ${id} deleted successfully`,
            };
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
