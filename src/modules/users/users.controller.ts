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
import { Notice, RatePlan, UserPoints, Users } from 'src/models';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionService } from '../transactions/transactions.service';
import { DateFilterDto } from 'src/common/dto/common.dto';
import { GetTransactionDto } from '../transactions/dto/get-transaction.dto';
import { CreatePointRechargeRequestDto } from '../points/dto/point-recharge-request.dto';
import { PointRechargeRequests } from 'src/models/point-recharge-requests.model';
import { PointsService } from '../points/points.service';
import { GetPointUsageDto } from '../transactions/dto/get-point-usage.dto';
import { RatePlanService } from '../rate-plans/rate-plan.service';
import { PaginatedResult } from 'src/interfaces/common.interface';
import { NoticeService } from '../notices/notices.service';
import { ENotice } from 'src/enums/notice.enum';
import { SearchNoticeDto } from '../notices/dto/search-notice.dto';
import { ApiKeyService } from '../api-key/api-key.service';
import { SearchApiKeyDto, UpdateApiKeyDto } from '../api-key/dto/api-key.dto';
import { ApiSampleService } from '../api-sample/api-sample.service';
import { GetSampleUsageDto } from '../api-sample/dto/api-sample-usage.dto';
import { CreateAnswerDto, CreateQuestionDto } from '../question-and-answers/dto/create-question-and-answer.dto';
import { QuestionAndAnswersService } from '../question-and-answers/question-and-answers.service';
import { GetQuestionDto } from '../question-and-answers/dto/get-question-and-answer.dto';
import { AuthRoleGuard } from 'src/common/guards/authenticate.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { ERoles } from 'src/enums/base.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';
import { UserType } from 'src/enums/user.enum';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly transactionService: TransactionService,
    private readonly pointsService: PointsService,
    private readonly ratePlanService: RatePlanService,
    private readonly noticeService: NoticeService,
    private readonly apiKeyService: ApiKeyService,
    private readonly apiSampleUsage: ApiSampleService,
    private readonly questionAndAnswerService: QuestionAndAnswersService,
    private readonly s3Service: S3Service,
  ) {}

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/inquiry/history')
  @ApiOperation({ summary: 'Inquiry History' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The Inquiry history has been successfully got.',
    example: {
      success: true,
      data: {
        count: 2,
        totalPage: 1,
        currentPage: 1,
        take: 10,
        items: [
          {
            id: 1,
            createdAt: '2024-11-01T09:42:17.902Z',
            updatedAt: '2024-11-01T09:42:17.902Z',
            userId: 1,
            transactionType: 'match_view',
            points: -5000,
            requestId: null,
            productMatchesId: 194,
            pointRechargeRequestsId: null,
            productTitle: '[빠니깔레] [Made In Italy] 핸드 드로잉 캐주얼 반팔 티셔츠 F-ITEE14',
            apiKey: null,
            isUsedApiKey: false,
            user: {
              email: 'jony@example.com',
            },
          },
          {
            id: 2,
            createdAt: '2024-11-01T04:16:08.316Z',
            updatedAt: '2024-11-01T04:16:08.316Z',
            userId: 1,
            transactionType: 'match_view',
            points: -5000,
            requestId: null,
            productMatchesId: 195,
            pointRechargeRequestsId: null,
            productTitle: '[빠니깔레] [Made In Italy] 핸드 드로잉 캐주얼 반팔 티셔츠 F-ITEE14',
            apiKey: null,
            isUsedApiKey: false,
            user: {
              email: 'jony@example.com',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  getinquiryhistory(@Query() dateFilterDto: DateFilterDto, @Request() req) {
    const userId: number = req.user.id;
    return this.transactionService.getInquiryHistoryByUserId(userId, dateFilterDto);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/point/deduct/history')
  @ApiOperation({ summary: 'Point Decduted History' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The point deducted history has been successfully got.',
    example: {
      success: true,
      data: {
        count: 2,
        totalPage: 1,
        currentPage: 1,
        take: 10,
        items: [
          {
            id: 1,
            createdAt: '2024-11-01T09:42:17.902Z',
            updatedAt: '2024-11-01T09:42:17.902Z',
            userId: 1,
            transactionType: 'match_view',
            points: -5000,
            requestId: null,
            productMatchesId: 194,
            pointRechargeRequestsId: null,
            productTitle: '[빠니깔레] [Made In Italy] 핸드 드로잉 캐주얼 반팔 티셔츠 F-ITEE14',
            apiKey: null,
            isUsedApiKey: false,
            user: {
              email: 'jony@example.com',
            },
          },
          {
            id: 2,
            createdAt: '2024-11-01T04:16:08.316Z',
            updatedAt: '2024-11-01T04:16:08.316Z',
            userId: 1,
            transactionType: 'match_view',
            points: -5000,
            requestId: null,
            productMatchesId: 195,
            pointRechargeRequestsId: null,
            productTitle: '[빠니깔레] [Made In Italy] 핸드 드로잉 캐주얼 반팔 티셔츠 F-ITEE14',
            apiKey: null,
            isUsedApiKey: false,
            user: {
              email: 'jony@example.com',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  getAllTransactionByUserId(@Query() payload: GetTransactionDto, @Request() req) {
    const userId: number = req.user.id;
    return this.transactionService.getAllDeductedHistoryByUserId(userId, payload);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Post('/recharge')
  @ApiOperation({ summary: 'Point Recharge Request' })
  @ApiBody({ type: CreatePointRechargeRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The point recharge request has been successfully created.',
    type: PointRechargeRequests,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal Server Error.' })
  createPointRechargeRequest(
    @Body() createPointRechargeRequestDto: CreatePointRechargeRequestDto,
    @Request() req,
  ): Promise<PointRechargeRequests> {
    const userId: number = req.user.id;
    return this.pointsService.createRechargeRequest(createPointRechargeRequestDto, userId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/point/usage-history')
  @ApiOperation({ summary: 'Point usage History' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The Point usage history has been successfully got.',
    example: {
      success: true,
      data: {
        count: 2,
        totalPage: 1,
        currentPage: 1,
        take: 10,
        items: [
          {
            id: 1,
            createdAt: '2024-11-01T09:42:17.902Z',
            updatedAt: '2024-11-01T09:42:17.902Z',
            userId: 1,
            transactionType: 'match_view',
            points: -5000,
            requestId: null,
            productMatchesId: 194,
            pointRechargeRequestsId: null,
            productTitle: '[빠니깔레] [Made In Italy] 핸드 드로잉 캐주얼 반팔 티셔츠 F-ITEE14',
            apiKey: null,
            isUsedApiKey: false,
            user: {
              email: 'jony@example.com',
            },
          },
          {
            id: 2,
            createdAt: '2024-11-01T04:16:08.316Z',
            updatedAt: '2024-11-01T04:16:08.316Z',
            userId: 1,
            transactionType: 'match_view',
            points: -5000,
            requestId: null,
            productMatchesId: 195,
            pointRechargeRequestsId: null,
            productTitle: '[빠니깔레] [Made In Italy] 핸드 드로잉 캐주얼 반팔 티셔츠 F-ITEE14',
            apiKey: null,
            isUsedApiKey: false,
            user: {
              email: 'jony@example.com',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  getPointUsageHistory(@Query() getPointUsageDto: GetPointUsageDto, @Request() req) {
    const userId: number = req.user.id;
    return this.transactionService.getPointUsageHistoryByUserId(userId, getPointUsageDto);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/rate-plans')
  @ApiOperation({ summary: 'Get all rate plans' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all rate plans successfully',
    example: {
      success: true,
      data: {
        count: 3,
        totalPage: 1,
        currentPage: 1,
        take: 10,
        items: [
          {
            id: 1,
            createdAt: '2024-10-29T08:37:00.018Z',
            updatedAt: '2024-10-29T08:37:00.018Z',
            name: 'Basic Plan',
            points: 5000,
            deletedAt: null,
          },
          {
            id: 2,
            createdAt: '2024-10-29T09:10:43.012Z',
            updatedAt: '2024-10-29T09:10:43.012Z',
            name: 'Standard Plan',
            points: 10000,
            deletedAt: null,
          },
          {
            id: 3,
            createdAt: '2024-10-29T09:10:43.012Z',
            updatedAt: '2024-10-29T09:10:43.012Z',
            name: 'Premium Plan',
            points: 30000,
            deletedAt: null,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  getAllRatePlans(): Promise<RatePlan[]> {
    return this.ratePlanService.findAllRatePlans();
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/notices')
  @ApiOperation({ summary: 'Get all notices' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get notices successfully',
    example: {
      success: true,
      data: {
        count: 2,
        totalPage: 1,
        currentPage: 1,
        take: 10,
        items: [
          {
            id: 1,
            createdAt: '2024-10-29',
            updatedAt: '2024-10-29',
            type: 'Announcement',
            title: 'Notice 1',
            content: 'This is the content for notice 1.',
            isPublished: true,
            publishedAt: '2024-10-29',
            deletedAt: null,
          },
          {
            id: 2,
            createdAt: '2024-10-29',
            updatedAt: '2024-10-29',
            type: 'Update',
            title: 'Notice 2',
            content: 'This is the content for notice 2.',
            isPublished: true,
            publishedAt: '2024-10-29',
            deletedAt: null,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  getAllNotices(@Query() searchNoticeDto: SearchNoticeDto): Promise<PaginatedResult<Notice>> {
    return this.noticeService.findAll(searchNoticeDto, ENotice.PUBLISHED);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/api-keys')
  @ApiOperation({ summary: 'Get all api key of a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all api key of a user successfully',
    example: {
      success: true,
      data: {
        count: 2,
        totalPage: 1,
        currentPage: 1,
        take: 10,
        items: [
          {
            id: 1,
            createdAt: '2024-10-29T03:48:28.287Z',
            updatedAt: '2024-10-29T07:10:14.636Z',
            userId: 1,
            apiKey: '88FFSADFSDFD09',
            name: 'apiKey1',
            expiredAt: '2024-11-28T03:48:28.286Z',
            limit: 5,
            isActive: true,
          },
          {
            id: 2,
            createdAt: '2024-10-29T03:48:28.287Z',
            updatedAt: '2024-10-29T07:10:14.636Z',
            userId: 1,
            apiKey: '89FFSADFSDFD09',
            name: 'apiKey2',
            expiredAt: '2024-11-28T03:48:28.286Z',
            limit: 5,
            isActive: true,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  getAllUserApiKey(@Query() payload: SearchApiKeyDto, @Request() req) {
    const userId: number = req.user.id;
    return this.apiKeyService.findAllApiKeyByUserId(userId, payload);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Put('/api-keys/:id')
  @ApiOperation({ summary: 'Update api key status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Update api key status Successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  updateApiKeyStatus(@Param('id') id: number, @Body() updateApiKeyDto: UpdateApiKeyDto, @Request() req) {
    const userId: number = req.user.id;
    return this.apiKeyService.updateApiKeyStatus(id, userId, updateApiKeyDto);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/api-sample-usages')
  @ApiOperation({ summary: 'Get all sample usage' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all sample usage Successfully',
    example: {
      success: true,
      data: [
        {
          id: 19,
          createdAt: '2024-10-29T09:10:43.018Z',
          updatedAt: '2024-10-29T09:10:43.018Z',
          name: 'Upload Image',
          endpoint: '/open-api/upload-image',
          method: 'POST',
          module: 'upload-image',
          attribute: [
            {
              name: 'apiKey',
              type: 'string',
              description: 'An API key is required to access the open API',
            },
            {
              name: 'autoRenew',
              type: 'boolean',
              description: 'Auto renew status of the img',
            },
            {
              name: 'productName',
              type: 'string',
              description: 'Name of the img',
            },
            {
              name: 'title',
              type: 'string',
              description: 'Title of the img',
            },
            {
              name: 'productDescription',
              type: 'string',
              description: 'Description of the img',
            },
            {
              name: 'tags',
              type: 'array',
              description: 'Tags of the img',
            },
          ],
          description: 'Api used to upload img',
          sampleResponse: {
            autoRenew: false,
            id: 1,
            pointsUsed: 0,
            userId: 1,
            status: 'doubt',
            expirationDate: '2024-11-29T03:49:26.036Z',
            updatedAt: '2024-10-29T03:49:26.036Z',
            createdAt: '2024-10-29T03:49:26.036Z',
            completedAt: null,
            deletedAt: null,
          },
          deletedAt: null,
          sampleRequest: [
            {
              content:
                'curl -X POST \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "autoRenew": false,\n    "productName": "Sample Image",\n    "title": "Sample Title",\n    "productDescription": "Description of the sample image.",\n    "tags": ["sample", "image"]\n  }\' \\\n  https://example.com/open-api/upload-image',
              lang_type: 'bash',
            },
            {
              content:
                "axios.post('/open-api/upload-image', {\n  autoRenew: false,\n  productName: 'Sample Image',\n  title: 'Sample Title',\n  productDescription: 'Description of the sample image.',\n  tags: ['sample', 'image']\n}).then(response => {\n  console.log(response.data);\n}).catch(error => {\n  console.error(error);\n});",
              lang_type: 'axios',
            },
          ],
        },
        {
          id: 20,
          createdAt: '2024-10-29T09:10:43.018Z',
          updatedAt: '2024-10-29T09:10:43.018Z',
          name: 'Image list',
          endpoint: '/open-api/image-list',
          method: 'GET',
          module: 'image-list',
          attribute: [
            {
              name: 'apiKey',
              type: 'string',
              description: 'An API key is required to access the open API',
            },
            {
              name: 'status',
              type: 'string',
              description: 'The status of the img',
            },
            {
              name: 'search',
              type: 'string',
              description: 'The search keyword',
            },
          ],
          description: "Api used to view all user's img",
          sampleResponse: {
            id: 1,
            createdAt: '2024-10-29T03:49:26.036Z',
            updatedAt: '2024-10-29T03:49:26.036Z',
            userId: 1,
            status: 'doubt',
            completedAt: null,
            pointsUsed: 0,
            expirationDate: '2024-11-29T03:49:26.036Z',
            autoRenew: false,
            deletedAt: null,
            productInfo: [
              {
                id: 1,
                createdAt: '2024-10-29T03:49:26.047Z',
                updatedAt: '2024-10-29T03:49:26.047Z',
                requestId: 1,
                imageUrl: 'https://example.com/85389d30-1dbd-49df-9e15-17a77c3a9dbe-morcoven.jpg',
                productName: 'test1',
                productDescription: 'abc',
                tags: '["jean"]',
                isHistorical: false,
                title: 'test1',
              },
            ],
          },
          deletedAt: null,
          sampleRequest: [
            {
              content:
                "curl -X GET \\\n  -G https://example.com/open-api/image-list \\\n  --data-urlencode 'status=active' \\\n  --data-urlencode 'search=sample'",
              lang_type: 'bash',
            },
            {
              content:
                "axios.get('/open-api/image-list', {\n  params: {\n    status: 'active',\n    search: 'sample'\n  }\n}).then(response => {\n  console.log(response.data);\n}).catch(error => {\n  console.error(error);\n});",
              lang_type: 'axios',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getSample(@Query() payload: GetSampleUsageDto) {
    return this.apiSampleUsage.getAllSampleUsage(payload);
  }

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

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Post('/qna/questions')
  @ApiOperation({ summary: 'Create a question' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create question Successfully',
    type: CreateQuestionDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async createQuestion(@Body() createQuestion: CreateQuestionDto, @Request() req) {
    const userId: number = req.user.id;
    return this.questionAndAnswerService.createQuestion(createQuestion, userId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/qna/questions')
  @ApiOperation({ summary: 'Get all question of a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all question of a user successfully',
    example: {
      success: true,
      data: {
        count: 2,
        totalPage: 1,
        currentPage: 1,
        take: 10,
        items: [
          {
            id: 1,
            userId: 12,
            contnet: 'How can i change password?',
            updatedAt: '2024-11-15T06:54:28.931Z',
            createdAt: '2024-11-15T06:54:28.931Z',
            deletedAt: null,
          },
          {
            id: 2,
            userId: 12,
            content: 'What is the highest fee?',
            updatedAt: '2024-11-15T06:54:28.931Z',
            createdAt: '2024-11-15T06:54:28.931Z',
            deletedAt: null,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getAllUsersQuestion(@Query() getQuestionDto: GetQuestionDto) {
    return this.questionAndAnswerService.findAllUsersQuestion(getQuestionDto);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/qna/:id')
  @ApiOperation({ summary: 'Get a specific question or answer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get successfully',
    example: {
      success: true,
      data: {
        id: 1,
        userId: 12,
        content: 'How can i change password?',
        updatedAt: '2024-11-15T06:54:28.931Z',
        createdAt: '2024-11-15T06:54:28.931Z',
        parentId: null,
        deletedAt: null,
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getAQuestion(@Param('id') id: number) {
    return this.questionAndAnswerService.findById(id);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/qna/questions/:questionId/answer')
  @ApiOperation({ summary: 'Get all answers of a question' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get answer successfully',
    example: {
      success: true,
      data: {
        answers: [
          {
            id: 3,
            userId: 12,
            parentId: 1,
            content: 'It is creation fee',
            updatedAt: '2024-11-15T06:54:28.931Z',
            createdAt: '2024-11-15T06:54:28.931Z',
            deletedAt: null,
            user: {
              avtUrl: 'http://example.com/avatar2.png',
              firstName: 'Jony',
              lastName: 'Smart',
            },
          },
          {
            id: 4,
            userId: 12,
            parentId: 1,
            content: 'It is creation fee',
            updatedAt: '2024-11-15T06:54:28.931Z',
            createdAt: '2024-11-15T06:54:28.931Z',
            deletedAt: null,
            user: {
              avtUrl: 'http://example.com/avatar2.png',
              firstName: 'Jony',
              lastName: 'Smart',
            },
          },
          {
            id: 5,
            userId: 12,
            parentId: 1,
            content: '',
            updatedAt: '2024-11-15T06:54:28.931Z',
            createdAt: '2024-11-15T06:54:28.931Z',
            deletedAt: '2024-11-15T06:54:28.931Z',
            user: {
              avtUrl: 'http://example.com/avatar2.png',
              firstName: 'Jony',
              lastName: 'Smart',
            },
          },
          {
            id: 6,
            userId: 12,
            parentId: 1,
            content: '',
            updatedAt: '2024-11-15T06:54:28.931Z',
            createdAt: '2024-11-15T06:54:28.931Z',
            deletedAt: '2024-11-15T06:54:28.931Z',
            user: {
              avtUrl: 'http://example.com/avatar2.png',
              firstName: 'Jony',
              lastName: 'Smart',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getAnswer(@Param('questionId') questionId: number) {
    return this.questionAndAnswerService.getAllAnswerByQuestionId(questionId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Post('/qna/questions/:questionId/answer')
  @ApiOperation({ summary: 'Create a answer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create answer Successfully',
    type: CreateAnswerDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async createAnswer(@Body() createAnswer: CreateAnswerDto, @Param('questionId') questionId: number, @Request() req) {
    const userId: number = req.user.id;
    return this.questionAndAnswerService.createAnswer(createAnswer, questionId, userId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/points')
  @ApiOperation({ summary: 'Get point of a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The point of a user successfully got.',
    example: {
      success: true,
      data: {
        id: 1,
        createdAt: '2024-11-01T09:38:39.174Z',
        updatedAt: '2024-11-01T09:42:17.902Z',
        userId: 27,
        points: 100000,
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getUserPoint(@Request() req): Promise<UserPoints> {
    const userId: number = req.user.id;
    return await this.pointsService.getUserPoints(userId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/points/recharged/total')
  @ApiOperation({ summary: 'Get total recharged point of a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The data successfully got.',
    example: {
      success: true,
      data: {
        number: '12000',
        time: '2024-01-02T04:08:58.693Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getTotalPointRecharged(@Request() req) {
    const userId: number = req.user.id;
    return await this.pointsService.getTotalRechargedPoints(userId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/points/deducted/total')
  @ApiOperation({ summary: 'Get total deducted point of a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The data successfully got.',
    example: {
      success: true,
      data: {
        number: '-12000',
        time: '2024-01-02T04:08:58.693Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getTotalDeductedPoint(@Request() req) {
    const userId: number = req.user.id;
    return await this.transactionService.getTotalDeductedPoint(userId);
  }
}
