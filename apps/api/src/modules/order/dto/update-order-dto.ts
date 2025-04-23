import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS } from 'src/commons/constants/orderStatus';

export class UpdateOrderDto {
    orderId: string;

    @ApiProperty({ description: 'order status', enum: ORDER_STATUS })
    status: keyof typeof ORDER_STATUS;
}
