import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateImageDto } from './dto/create-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
    constructor(private imagesService: ImagesService) { }

    // ─── Trang chủ ───────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: 'GET danh sách tất cả ảnh' })
    getAllImages() {
        return this.imagesService.getAllImages();
    }

    @Get('search')
    @ApiOperation({ summary: 'GET tìm kiếm ảnh theo tên' })
    @ApiQuery({ name: 'name', required: true, example: 'sunset' })
    searchImages(@Query('name') name: string) {
        return this.imagesService.searchImagesByName(name);
    }

    // ─── Trang chi tiết ──────────────────────────────────────

    @Get(':imageId')
    @ApiOperation({ summary: 'GET thông tin ảnh và người tạo theo id ảnh' })
    getImageById(@Param('imageId', ParseIntPipe) imageId: number) {
        return this.imagesService.getImageById(imageId);
    }

    @Get(':imageId/comments')
    @ApiOperation({ summary: 'GET bình luận theo id ảnh' })
    getComments(@Param('imageId', ParseIntPipe) imageId: number) {
        return this.imagesService.getCommentsByImageId(imageId);
    }

    @Get(':imageId/is-saved')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'GET kiểm tra ảnh đã lưu chưa (dùng cho nút Save)' })
    checkSaved(
        @Param('imageId', ParseIntPipe) imageId: number,
        @Req() req,
    ) {
        return this.imagesService.checkSavedImage(imageId, req.user.id);
    }

    @Post(':imageId/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'POST thêm bình luận vào ảnh' })
    addComment(
        @Param('imageId', ParseIntPipe) imageId: number,
        @Body('content') content: string,
        @Req() req,
    ) {
        return this.imagesService.addComment(imageId, req.user.id, content);
    }

    // ─── Trang quản lý ảnh ───────────────────────────────────

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'POST tạo ảnh mới' })
    createImage(@Body() dto: CreateImageDto, @Req() req) {
        return this.imagesService.createImage(req.user.id, dto);
    }

    @Post(':imageId/save')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'POST lưu / bỏ lưu ảnh (toggle)' })
    toggleSave(
        @Param('imageId', ParseIntPipe) imageId: number,
        @Req() req,
    ) {
        return this.imagesService.toggleSaveImage(imageId, req.user.id);
    }

    @Delete(':imageId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'DELETE xóa ảnh đã tạo theo id ảnh' })
    deleteImage(
        @Param('imageId', ParseIntPipe) imageId: number,
        @Req() req,
    ) {
        return this.imagesService.deleteImage(imageId, req.user.id);
    }

    // Thêm vào trong ImagesController
    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload ảnh từ máy tính' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            url: `http://localhost:3000/uploads/${file.filename}`,
            filename: file.filename,
        };
}
}