import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/sequelize";
import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from "./dto/user.dto";
import { Users } from "src/models";
import { Op, Sequelize } from "sequelize";
import { EncryptHelper } from "src/helpers/encrypt.helper";
import { ErrorHelper } from "src/helpers/error.utils";
import * as USER_MESSAGE from "src/common/messages/user.message";
import { ConfigService } from "@nestjs/config";
import { TokenHelper } from "src/helpers/token.helper";
import { IToken } from "src/interfaces/auth.interface";
import { GetUserDto } from "./dto/get-user.dto";
import { getPagination } from "src/utils/common";
import { PaginatedResult } from "src/interfaces/common.interface";
import { TimeFilterDto } from "src/common/dto/common.dto";
import { buildStatisticQueryParams } from "src/utils/statistic-query";
import { addMissingValue } from "src/utils/format-statistic-result";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users)
    private readonly userModel: typeof Users,
    private configService: ConfigService,
    @InjectConnection()
    private readonly sequelize: Sequelize
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<string> {
    const { email, password } = createUserDto;

    await this.checkUserEmail(email);

    const hashedPassword = await EncryptHelper.hash(password, 10);
    const user: Users = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const secret = this.configService.get("TOKEN_SECRET");
    const expiresIn = this.configService.get("TOKEN_EXPIRES_IN");
    const { token: confirmToken } = TokenHelper.generate(
      { id: user.id },
      secret,
      expiresIn
    );
    return confirmToken;
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
      },
    });
  }

  private async checkUserEmail(email: string) {
    const user = await this.findByEmail(email);

    if (user) {
      ErrorHelper.BadRequestException(USER_MESSAGE.USED_EMAIL);
    }
  }

  async forgotPassword(email: string) {
    const user: Users = await this.findByEmail(email);
    if (!user) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_EMAIL);
    }
    const secret = this.configService.get("TOKEN_SECRET");
    const expiresIn = this.configService.get("TOKEN_EXPIRES_IN");
    const { token: confirmToken } = TokenHelper.generate(
      { id: user.id },
      secret,
      expiresIn
    );
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
      }
    );
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user: Users = await this.findById(userId);

    const { oldPassword, newPassword } = changePasswordDto;

    const isPasswordValid = await EncryptHelper.compare(
      oldPassword,
      user.password
    );

    if (!isPasswordValid) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_PASSWORD);
    }
    const hashedPassword = await EncryptHelper.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
    });

    return true;
  }

  async editUser(
    updateUserDto: UpdateUserDto,
    avtUrl: string | null,
    userId: number
  ): Promise<Users> {
    const user: Users = await this.findById(userId);
    const { isDeleteAvatar } = updateUserDto;
    if (isDeleteAvatar == "true") {
      avtUrl = " ";
    }
    await user.update({
      ...updateUserDto,
      ...(avtUrl && { avtUrl }),
    });
    const updatedUser = user.get({ plain: true });
    const fieldsToExclude = ["password", "isAdmin", "isVerified", "deletedAt"];
    fieldsToExclude.forEach((field) => {
      delete updatedUser[field];
    });
    return updatedUser;
  }

  async findUserByRefreshToken(refreshToken: string) {
    return this.userModel.findOne({
      where: {
        refresToken: refreshToken,
        refreshTokenExpireDate: {
          [Op.gte]: new Date(),
        },
      },
    });
  }

  async updateUserToken(refreshToken: string, expiresIn: Date, id: number) {
    await this.userModel.update(
      { refresToken: refreshToken, refreshTokenExpireDate: expiresIn },
      {
        where: {
          id,
        },
      }
    );
  }
}
