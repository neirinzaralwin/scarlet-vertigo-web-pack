import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ description: 'Product name' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Product description' })
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Product price' })
    @IsNotEmpty()
    price: number;

    @ApiProperty({ description: 'Product stock' })
    @IsNotEmpty()
    stock: number;

    @ApiProperty({ description: 'Category id' })
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ description: 'Size id' })
    @IsNotEmpty()
    sizeId: string;

    @ApiProperty({ description: 'Created at' })
    @IsOptional()
    createdAt: Date;

    @ApiProperty({ description: 'Updated at' })
    @IsOptional()
    updatedAt: Date;
}
