import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChangePasswordDto, UpdateUserDto } from './dto/user.dto';
import { Users } from 'src/models';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DateFilterDto } from 'src/common/dto/common.dto';
import { AuthRoleGuard } from 'src/common/guards/authenticate.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { ERoles } from 'src/enums/base.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}


  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Post('/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User password changed.',
    type: ChangePasswordDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error.' })
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    const userId: number = req.user.id;
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Roles(ERoles.USER, ERoles.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/profile')
  @ApiOperation({ summary: 'Get information of the user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The information of the user successfully got.',
    example: {
      success: true,
      data: {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        zip_code: '67890',
        address: '456 Oak St, Springfield',
        contact_number: '555-5678',
        avt_url: 'http://example.com/avatar2.png',
        is_admin: false,
        is_verify: false,
        created_at: '2024-10-29T02:29:13.059Z',
        updated_at: '2024-10-29T02:29:13.059Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async findOne(@Request() req): Promise<Users> {
    const userId: number = req.user.id;
    const foundUser: Users = await this.usersService.findById(userId);
    const user: Users = foundUser.get({ plain: true });
    delete user['password'];
    return user;
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Put('/profile')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The information of the user successfully updated.',
    example: {
      success: true,
      data: {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        zip_code: '67890',
        address: '456 Oak St, Springfield',
        contact_number: '555-5678',
        avt_url: 'http://example.com/avatar2.png',
        is_admin: false,
        is_verify: false,
        created_at: '2024-10-29T02:29:13.059Z',
        updated_at: '2024-10-29T02:29:13.059Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async editUserInfo(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<Users> {
    let avtUrl: string | null;
    if (file) {
      avtUrl = await this.s3Service.uploadFile(file);
    }
    const userId: number = req.user.id;
    return this.usersService.editUser(updateUserDto, avtUrl, userId);
  }

}
