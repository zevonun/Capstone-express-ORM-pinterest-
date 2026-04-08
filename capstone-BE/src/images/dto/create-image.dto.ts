import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
    @ApiProperty({ example: 'Sunset in Đà Lạt' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'https://example.com/image.jpg' })
    @IsNotEmpty()
    @IsString()
    url: string;

    @ApiProperty({ example: 'Mô tả ảnh', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}