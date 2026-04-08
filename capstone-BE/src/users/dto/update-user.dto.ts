import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ example: 'Nguyen Van A', required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ example: 22, required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    age?: number;
}