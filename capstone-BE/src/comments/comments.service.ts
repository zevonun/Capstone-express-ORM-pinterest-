import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    // POST tạo bình luận
    async createComment(userId: number, dto: CreateCommentDto) {
        // Kiểm tra ảnh tồn tại không
        const image = await this.prisma.image.findUnique({
            where: { id: dto.imageId },
        });
        if (!image) throw new NotFoundException('Không tìm thấy ảnh');

        return this.prisma.comment.create({
            data: {
                content: dto.content,
                imageId: dto.imageId,
                userId,
            },
            include: {
                user: {
                    select: { id: true, fullName: true, avatar: true },
                },
                image: {
                    select: { id: true, name: true },
                },
            },
        });
    }

    // GET tất cả comment của 1 ảnh
    async getCommentsByImageId(imageId: number) {
        const image = await this.prisma.image.findUnique({ where: { id: imageId } });
        if (!image) throw new NotFoundException('Không tìm thấy ảnh');

        return this.prisma.comment.findMany({
            where: { imageId },
            include: {
                user: {
                    select: { id: true, fullName: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // GET tất cả comment của 1 user
    async getCommentsByUserId(userId: number) {
        return this.prisma.comment.findMany({
            where: { userId },
            include: {
                image: {
                    select: { id: true, name: true, url: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // DELETE xóa comment (chỉ người tạo mới được xóa)
    async deleteComment(commentId: number, userId: number) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
        if (comment.userId !== userId) {
            throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
        }

        await this.prisma.comment.delete({ where: { id: commentId } });
        return { message: 'Xóa bình luận thành công' };
    }
}