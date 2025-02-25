import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto/user.dto';
import { Users } from 'src/models';
import { UserPoints } from 'src/models';
import { col, fn, literal, Op, Sequelize } from 'sequelize';
import { EncryptHelper } from 'src/helpers/encrypt.helper';
import { ErrorHelper } from 'src/helpers/error.utils';
import * as USER_MESSAGE from 'src/common/messages/user.message';
import { ConfigService } from '@nestjs/config';
import { TokenHelper } from 'src/helpers/token.helper';
import { IToken } from 'src/interfaces/auth.interface';
import { GetUserDto } from './dto/get-user.dto';
import { getPagination } from 'src/utils/common';
import { PaginatedResult } from 'src/interfaces/common.interface';
import { TimeFilterDto } from 'src/common/dto/common.dto';
import { buildStatisticQueryParams } from 'src/utils/statistic-query';
import { addMissingValue, formatStatisticData } from 'src/utils/format-statistic-result';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users)
    private readonly userModel: typeof Users,
    @InjectModel(UserPoints)
    private readonly userPointModel: typeof UserPoints,
    private configService: ConfigService,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<string> {
    const { email, password } = createUserDto;

    const isEmailUsed: Boolean = await this.checkUserEmail(email);

    if (!isEmailUsed) {
      ErrorHelper.BadRequestException(USER_MESSAGE.USED_EMAIL);
    }
    const hashedPassword = await EncryptHelper.hash(password, 10);
    const user: Users = await this.userModel.create({ ...createUserDto, password: hashedPassword });
    const secret = this.configService.get('TOKEN_SECRET');
    const expiresIn = this.configService.get('TOKEN_EXPIRES_IN');
    const { token: confirmToken } = TokenHelper.generate({ id: user.id }, secret, expiresIn);
    return confirmToken;
  }

  async getAll(getUserDto: GetUserDto): Promise<PaginatedResult<Users>> {
    const { email } = getUserDto;
    const { offset, page, take } = getPagination(getUserDto);
    const baseWhere: Record<string, any> = {};
    if (email) {
      baseWhere.email = { [Op.like]: `%${email}%` };
    }

    const { count, rows: inquiryHistory } = await this.userModel.findAndCountAll({
      where: { ...baseWhere, isAdmin: false },
      attributes: { exclude: ['password'] },
      limit: take,
      offset,
      order: [['id', 'ASC']],
      distinct: true,
    });

    return {
      count,
      totalPage: Math.ceil(count / take),
      currentPage: page,
      take,
      items: inquiryHistory,
    };
  }

  findById(id: number): Promise<Users> {
    return this.userModel.findOne({
      where: { id },
    });
  }

  async verifyUser(id: number): Promise<Users> {
    return this.findById(id);
  }

  async findByEmail(email: string): Promise<Users> {
    return await this.userModel.findOne({
      where: {
        email: email,
        isVerified: true,
      },
    });
  }

  private async checkUserEmail(email: string): Promise<Boolean> {
    const user = await this.findByEmail(email);

    if (user) {
      if (user.isVerified) {
        return false;
      }
      await user.destroy();
      return true;
    }

    return true;
  }

  async confirmRegister(payload: IToken) {
    const transaction = await this.sequelize.transaction();
    const { id } = payload;
    const user: Users = await this.findById(id);
    if (!user) {
      ErrorHelper.BadRequestException(USER_MESSAGE.NOT_FOUND);
    }
    try {
      await user.update(
        {
          isVerified: true,
        },
        {
          transaction,
        },
      );
      await this.userPointModel.create(
        {
          userId: user.id,
          points: 0,
        },
        { transaction },
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Registration confirmation failed`);
    }
  }

  async forgotPassword(email: string) {
    const user: Users = await this.findByEmail(email);
    if (!user || !user?.isVerified) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_EMAIL);
    }
    const secret = this.configService.get('TOKEN_SECRET');
    const expiresIn = this.configService.get('TOKEN_EXPIRES_IN');
    const { token: confirmToken } = TokenHelper.generate({ id: user.id }, secret, expiresIn);
    return confirmToken;
  }

  async verifyForgotPassword(payload: IToken, password: string) {
    const { id } = payload;
    const hashedPassword = await EncryptHelper.hash(password, 10);
    await this.userModel.update(
      {
        password: hashedPassword,
      },
      {
        where: {
          id: id,
        },
      },
    );
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user: Users = await this.findById(userId);

    const { oldPassword, newPassword } = changePasswordDto;

    const isPasswordValid = await EncryptHelper.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_PASSWORD);
    }
    const hashedPassword = await EncryptHelper.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
    });

    return true;
  }

  async editUser(updateUserDto: UpdateUserDto, avtUrl: string | null, userId: number): Promise<Users> {
    const user: Users = await this.findById(userId);
    const { isDeleteAvatar } = updateUserDto;
    if (isDeleteAvatar == 'true') {
      avtUrl = ' ';
    }
    await user.update({
      ...updateUserDto,
      ...(avtUrl && { avtUrl }),
    });
    const updatedUser = user.get({ plain: true });
    const fieldsToExclude = ['password', 'isAdmin', 'isVerified', 'deletedAt'];
    fieldsToExclude.forEach((field) => {
      delete updatedUser[field];
    });
    return updatedUser;
  }

  async getUserStatistics(timeFilterDto: TimeFilterDto) {
    const { year, month, day } = timeFilterDto;
    const { attributes, group, where } = buildStatisticQueryParams(year, month, day);
    attributes.push([Sequelize.fn('COUNT', Sequelize.col('id')), 'total']);
    const users = await this.userModel.findAll({
      attributes,
      where: {
        ...where,
        isVerified: true,
      },
      group,
      raw: true,
    });
    const results = addMissingValue(users, month, day);
    return {
      xName: '시간',
      yName: '수량',
      data: [
        {
          label: '사용자',
          name: '사용자',
          values: results,
        },
      ],
    };
  }

  async updateUserStatus(updateUserStatusDto: UpdateUserStatusDto, userId: number) {
    await this.userModel.update(
      {
        isVerified: updateUserStatusDto.status,
      },
      {
        where: {
          id: userId,
        },
      },
    );
  }

  async getTotalUser() {
    const result = await this.userModel.findOne({
      attributes: [
        [Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('id')), 'INTEGER'), 'number'],
        [Sequelize.fn('MIN', Sequelize.col('created_at')), 'time'],
      ],
      where: {
        isVerified: true,
      },
    });

    return {
      label: '총 사용자 수',
      data: result,
    };
  }
}
