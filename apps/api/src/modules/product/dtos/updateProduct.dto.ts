import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProductDto {
    @ApiProperty({ description: 'Product name', required: false })
    @IsOptional()
    name: string;

    @ApiProperty({ description: 'Product description', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ description: 'Product price', required: false })
    @IsOptional()
    price: number;

    @ApiProperty({ description: 'Product stock', required: false })
    @IsOptional()
    stock: number;

    @ApiProperty({ description: 'Category id', required: false })
    @IsOptional()
    categoryId: string;

    @ApiProperty({ description: 'Size id', required: false })
    @IsOptional()
    sizeId: string;

    @ApiProperty({ description: 'Created at', required: false })
    @IsOptional()
    createdAt: Date;

    @ApiProperty({ description: 'Updated at', required: false })
    @IsOptional()
    updatedAt: Date;
}
