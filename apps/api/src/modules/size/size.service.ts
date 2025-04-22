import { Injectable } from '@nestjs/common';
import { SizeRepository } from './size.repository';
import { UpdateSizeDto } from './dtos/updateSize.dto';

@Injectable()
export class SizeService {
    constructor(private sizeRepository: SizeRepository) {}

    async create(name: string) {
        return await this.sizeRepository.create(name);
    }

    async getSizes() {
        return await this.sizeRepository.findAll();
    }

    async getSizeById(id: string) {
        return await this.sizeRepository.findById(id);
    }

    async update(updateSizeDto: UpdateSizeDto) {
        return await this.sizeRepository.update(updateSizeDto);
    }

    async delete(id: string) {
        return await this.sizeRepository.delete(id);
    }
}
