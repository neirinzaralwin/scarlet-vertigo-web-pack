import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({ description: 'id of the product' })
    @IsNotEmpty({ message: 'Product id is required' })
    productId: string;

    @ApiProperty({ description: 'quantity of the product' })
    @IsNotEmpty({ message: 'Quantity is required' })
    @Min(1, { message: 'Quantity must be greater than zero' })
    quantity: number;

    @ApiProperty({ description: 'Increase the quantity or decrease the quantity', enum: [0, 1], default: 1, required: false })
    isIncrement: 0 | 1;
}
