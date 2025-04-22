import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { SizeService } from './size.service';
import { UpdateSizeDto } from './dtos/updateSize.dto';
import { Public } from '../auth/decorators/public.decorator';
import { isAuthorized } from '../auth/decorators/isAuthorized.decorator';

@Controller('sizes')
export class SizeController {
    constructor(private readonly sizeService: SizeService) {}

    @isAuthorized()
    @Post('/')
    async create(@Body('name') name: string) {
        return this.sizeService.create(name);
    }

    @Public()
    @Get('/')
    async getSizes() {
        return this.sizeService.getSizes();
    }

    @Public()
    @Get('/:id')
    async getSizeById(@Param('id') id: string) {
        return this.sizeService.getSizeById(id);
    }

    @isAuthorized()
    @Put('/')
    async update(@Body() updateSizeDto: UpdateSizeDto) {
        return this.sizeService.update(updateSizeDto);
    }

    @isAuthorized()
    @Delete('/:id')
    async delete(@Param('id') id: string) {
        return this.sizeService.delete(id);
    }
}
