import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'user@gmail.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @ApiProperty({ example: 'Nguyen Van A', required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ example: 22, required: false })
    @IsOptional()
    age?: number;
}