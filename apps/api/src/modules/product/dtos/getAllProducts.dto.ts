import { IsOptional } from 'class-validator';

export class GetAllProductsDto {
    @IsOptional()
    skip: number;

    @IsOptional()
    limit: number;
}
