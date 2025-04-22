import { IsNotEmpty } from 'class-validator';

export class UpdateSizeDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    id: string;
}
