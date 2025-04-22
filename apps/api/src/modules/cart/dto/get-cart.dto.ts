import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetCartDto {
    @ApiProperty({ description: 'id of the cart' })
    @IsOptional()
    cartId: string;
}
