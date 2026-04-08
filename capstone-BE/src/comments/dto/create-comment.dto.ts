import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    imageId: number;

    @ApiProperty({ example: 'Ảnh đẹp quá!' })
    @IsNotEmpty()
    @IsString()
    content: string;
}