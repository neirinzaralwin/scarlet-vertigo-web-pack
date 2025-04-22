import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetOrderDto {
    @ApiProperty({ description: 'id of the order' })
    @IsOptional()
    orderId: string;
}
