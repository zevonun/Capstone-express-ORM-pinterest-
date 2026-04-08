import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class ImagesService {
    constructor(private prisma: PrismaService) { }

    // ─── Trang chủ ───────────────────────────────────────────

    // GET danh sách ảnh vẽ (tất cả ảnh)
    async getAllImages() {
        return this.prisma.image.findMany({
            include: {
                user: {
                    select: { id: true, fullName: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // GET tìm kiếm danh sách ảnh theo tên
    async searchImagesByName(name: string) {
        return this.prisma.image.findMany({
            where: {
                name: { contains: name },
            },
            include: {
                user: {
                    select: { id: true, fullName: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ─── Trang chi tiết ──────────────────────────────────────

    // GET thông tin ảnh và người tạo theo id ảnh
    async getImageById(imageId: number) {
        const image = await this.prisma.image.findUnique({
            where: { id: imageId },
            include: {
                user: {
                    select: { id: true, fullName: true, avatar: true, email: true },
                },
            },
        });
        if (!image) throw new NotFoundException('Không tìm thấy ảnh');
        return image;
    }

    // GET thông tin bình luận theo id ảnh
    async getCommentsByImageId(imageId: number) {
        await this.checkImageExists(imageId);
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

    // GET kiểm tra ảnh đã lưu hay chưa theo id ảnh
    async checkSavedImage(imageId: number, userId: number) {
        await this.checkImageExists(imageId);
        const saved = await this.prisma.savedImage.findUnique({
            where: {
                userId_imageId: { userId, imageId },
            },
        });
        return { isSaved: !!saved };
    }

    // POST lưu bình luận của người dùng với hình ảnh
    async addComment(imageId: number, userId: number, content: string) {
        await this.checkImageExists(imageId);
        return this.prisma.comment.create({
            data: { imageId, userId, content },
            include: {
                user: {
                    select: { id: true, fullName: true, avatar: true },
                },
            },
        });
    }

    // ─── Trang quản lý ảnh ───────────────────────────────────

    // GET danh sách ảnh đã lưu theo user id
    async getSavedImagesByUserId(userId: number) {
        return this.prisma.savedImage.findMany({
            where: { userId },
            include: {
                image: {
                    include: {
                        user: { select: { id: true, fullName: true, avatar: true } },
                    },
                },
            },
            orderBy: { savedAt: 'desc' },
        });
    }

    // GET danh sách ảnh đã tạo theo user id
    async getCreatedImagesByUserId(userId: number) {
        return this.prisma.image.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // POST tạo ảnh mới
    async createImage(userId: number, dto: CreateImageDto) {
        return this.prisma.image.create({
            data: { ...dto, userId },
        });
    }

    // POST lưu ảnh (save/unsave toggle)
    async toggleSaveImage(imageId: number, userId: number) {
        await this.checkImageExists(imageId);
        const existing = await this.prisma.savedImage.findUnique({
            where: { userId_imageId: { userId, imageId } },
        });

        if (existing) {
            // Đã lưu → bỏ lưu
            await this.prisma.savedImage.delete({
                where: { userId_imageId: { userId, imageId } },
            });
            return { message: 'Đã bỏ lưu ảnh' };
        } else {
            // Chưa lưu → lưu
            await this.prisma.savedImage.create({ data: { userId, imageId } });
            return { message: 'Lưu ảnh thành công' };
        }
    }

    // DELETE xóa ảnh đã tạo theo id ảnh
    async deleteImage(imageId: number, userId: number) {
        const image = await this.prisma.image.findUnique({
            where: { id: imageId },
        });
        if (!image) throw new NotFoundException('Không tìm thấy ảnh');
        if (image.userId !== userId) {
            throw new ForbiddenException('Bạn không có quyền xóa ảnh này');
        }
        await this.prisma.image.delete({ where: { id: imageId } });
        return { message: 'Xóa ảnh thành công' };
    }

    // ─── Helper ──────────────────────────────────────────────
    private async checkImageExists(imageId: number) {
        const image = await this.prisma.image.findUnique({ where: { id: imageId } });
        if (!image) throw new NotFoundException('Không tìm thấy ảnh');
        return image;
    }
}