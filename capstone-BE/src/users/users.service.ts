import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // GET thông tin user theo id
    async getUserById(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                avatar: true,
                age: true,
                createdAt: true,
            },
        });
        if (!user) throw new NotFoundException('Không tìm thấy user');
        return user;
    }

    // GET danh sách ảnh đã lưu theo user id
    async getSavedImages(userId: number) {
        await this.checkUserExists(userId);
        return this.prisma.savedImage.findMany({
            where: { userId },
            include: {
                image: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, avatar: true },
                        },
                    },
                },
            },
            orderBy: { savedAt: 'desc' },
        });
    }

    // GET danh sách ảnh đã tạo theo user id
    async getCreatedImages(userId: number) {
        await this.checkUserExists(userId);
        return this.prisma.image.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // PUT cập nhật thông tin user (chỉ update chính mình)
    async updateUser(currentUserId: number, targetUserId: number, dto: UpdateUserDto) {
        if (currentUserId !== targetUserId) {
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa user này');
        }
        await this.checkUserExists(targetUserId);
        return this.prisma.user.update({
            where: { id: targetUserId },
            data: dto,
            select: {
                id: true,
                email: true,
                fullName: true,
                avatar: true,
                age: true,
                createdAt: true,
            },
        });
    }

    // ─── Helper ──────────────────────────────────────────────
    private async checkUserExists(userId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Không tìm thấy user');
        return user;
    }
}