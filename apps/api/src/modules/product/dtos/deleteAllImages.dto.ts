import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class DeleteAllImagesDto {
    @ApiProperty({ description: 'product id to delete all images' })
    @IsOptional()
    productId: string;
}
