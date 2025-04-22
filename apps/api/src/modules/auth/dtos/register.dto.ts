import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @MinLength(3, { message: 'Name must be at least 3 characters long' })
    @MaxLength(30, { message: 'Name cannot exceed 30 characters' })
    name: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Email must be valid' })
    email: string;

    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
    password: string;
}
