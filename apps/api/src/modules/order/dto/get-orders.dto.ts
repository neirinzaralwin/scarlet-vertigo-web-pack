import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetOrdersDto {
    @ApiProperty({ description: 'user id' })
    @IsOptional()
    userId: string;

    @ApiProperty({ description: 'skip' })
    @IsOptional()
    skip: number;

    @ApiProperty({ description: 'limit' })
    @IsOptional()
    limit: number;
}
