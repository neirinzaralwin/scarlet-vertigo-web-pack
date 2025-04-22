import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteImageDto {
    @ApiProperty({ description: 'Image id to delete' })
    @IsNotEmpty({ message: 'Image id is required' })
    imageId: string;
}
