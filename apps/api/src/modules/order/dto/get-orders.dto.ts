import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetOrdersDto {
    @ApiProperty({ description: 'user id' })
    @IsOptional()
    userId: string;

    @IsOptional()
    skip: number;

    @IsOptional()
    limit: number;
}
