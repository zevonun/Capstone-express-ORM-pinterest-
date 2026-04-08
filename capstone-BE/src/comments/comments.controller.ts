import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
    constructor(private commentsService: CommentsService) { }

    // POST tạo bình luận mới
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'POST tạo bình luận cho ảnh' })
    createComment(@Body() dto: CreateCommentDto, @Req() req) {
        return this.commentsService.createComment(req.user.id, dto);
    }

    // GET tất cả comment theo imageId
    @Get('image/:imageId')
    @ApiOperation({ summary: 'GET danh sách bình luận theo id ảnh' })
    getCommentsByImage(@Param('imageId', ParseIntPipe) imageId: number) {
        return this.commentsService.getCommentsByImageId(imageId);
    }

    // GET tất cả comment của user đang đăng nhập
    @Get('my-comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'GET danh sách bình luận của user đang đăng nhập' })
    getMyComments(@Req() req) {
        return this.commentsService.getCommentsByUserId(req.user.id);
    }

    // DELETE xóa comment theo id
    @Delete(':commentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'DELETE xóa bình luận (chỉ người tạo)' })
    deleteComment(
        @Param('commentId', ParseIntPipe) commentId: number,
        @Req() req,
    ) {
        return this.commentsService.deleteComment(commentId, req.user.id);
    }
}