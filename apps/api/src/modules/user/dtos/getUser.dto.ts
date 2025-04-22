import { IsOptional, ValidateIf, IsNotEmpty } from 'class-validator';

const REQUIRED_FIELD_MESSAGE = 'At least one of  id or email must be provided';

export class GetUserDto {
    @IsOptional()
    @ValidateIf((o) => !o.email)
    @IsNotEmpty({
        message: REQUIRED_FIELD_MESSAGE,
    })
    id?: string;

    @IsOptional()
    @ValidateIf((o) => !o.id)
    @IsNotEmpty({
        message: REQUIRED_FIELD_MESSAGE,
    })
    email?: string;
}
