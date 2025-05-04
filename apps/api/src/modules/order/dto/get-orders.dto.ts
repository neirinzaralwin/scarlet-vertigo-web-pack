import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ORDER_STATUS } from 'src/commons/constants/orderStatus';

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

    @ApiProperty({ description: 'order status' })
    @IsOptional()
    status: keyof typeof ORDER_STATUS;
}
