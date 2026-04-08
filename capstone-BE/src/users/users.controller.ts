import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    // GET thông tin user (chính mình - từ token)
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'GET thông tin user đang đăng nhập' })
    getMe(@Req() req) {
        return this.usersService.getUserById(req.user.id);
    }

    // GET thông tin user theo id — public
    @Get(':userId')
    @ApiOperation({ summary: 'GET thông tin user theo id' })
    getUserById(@Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.getUserById(userId);
    }

    // GET danh sách ảnh đã lưu theo user id — public
    @Get(':userId/saved-images')
    @ApiOperation({ summary: 'GET danh sách ảnh đã lưu theo user id' })
    getSavedImages(@Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.getSavedImages(userId);
    }

    // GET danh sách ảnh đã tạo theo user id — public
    @Get(':userId/created-images')
    @ApiOperation({ summary: 'GET danh sách ảnh đã tạo theo user id' })
    getCreatedImages(@Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.getCreatedImages(userId);
    }

    // PUT cập nhật thông tin user — cần login
    @Put(':userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'PUT cập nhật thông tin user (chỉ update chính mình)' })
    updateUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: UpdateUserDto,
        @Req() req,
    ) {
        return this.usersService.updateUser(req.user.id, userId, dto);
    }
}