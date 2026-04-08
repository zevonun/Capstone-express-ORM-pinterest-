import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new BadRequestException('Email đã được sử dụng');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Tạo user mới
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                fullName: dto.fullName,
                age: dto.age,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                age: true,
                createdAt: true,
            },
        });

        return { message: 'Đăng ký thành công', user };
    }

    async login(dto: LoginDto) {
        // Tìm user theo email
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password || '');
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        // Tạo JWT token
        const token = await this.jwt.signAsync({
            userId: user.id,
            email: user.email,
        });

        return {
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
            },
        };
    }
}