import { Controller, Get, HttpStatus, Query, Request, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { ERoles } from 'src/enums/base.enum';
import { AuthRoleGuard } from 'src/common/guards/authenticate.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TimeFilterDto } from 'src/common/dto/common.dto';
import { LearningRequestService } from '../learning-request/learning-request.service';
import { RequestService } from '../requests/requests.service';
import { PointsService } from '../points/points.service';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly usersService: UsersService,
    private readonly learningRequestService: LearningRequestService,
    private readonly requestsService: RequestService,
    private readonly pointService: PointsService,
  ) {}

  @Roles(ERoles.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/users')
  @ApiOperation({ summary: 'Count number of user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get data successfully',
    example: {
      success: true,
      data: [
        {
          year: 2024,
          month: 11,
          day: 19,
          userCount: '2',
        },
        {
          year: 2024,
          month: 11,
          day: 22,
          userCount: '2',
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getUserStatistics(@Query() timeFilterDto: TimeFilterDto) {
    return this.usersService.getUserStatistics(timeFilterDto);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/requests/me')
  @ApiOperation({ summary: 'User request statistics by status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The data successfully got.',
    example: {
      success: true,
      data: [
        {
          label: 'Doubt Requests',
          name: 'Doubt Requests',
          values: [
            {
              x: 9,
              y: '1',
            },
            {
              x: 11,
              y: '1',
            },
            {
              x: 12,
              y: '1',
            },
          ],
        },
        {
          label: 'Expired Requests',
          name: 'Expired Requests',
          values: [
            {
              x: 10,
              y: '3',
            },
            {
              x: 11,
              y: '3',
            },
            {
              x: 12,
              y: '1',
            },
          ],
        },
        {
          label: 'In Maintenance Requests',
          name: 'In Maintenance Requests',
          values: [
            {
              x: 8,
              y: '1',
            },
            {
              x: 9,
              y: '2',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getRequestStatisticByUser(@Request() req, @Query() yearFilterDto: TimeFilterDto) {
    const userId: number = req.user.id;
    return await this.requestsService.getRequestStatistic(yearFilterDto, userId);
  }

  @Roles(ERoles.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/requests')
  @ApiOperation({ summary: 'User request statistics by status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The data successfully got.',
    example: {
      success: true,
      data: [
        {
          label: 'Doubt Requests',
          name: 'Doubt Requests',
          values: [
            {
              x: 9,
              y: '1',
            },
            {
              x: 11,
              y: '1',
            },
            {
              x: 12,
              y: '1',
            },
          ],
        },
        {
          label: 'Expired Requests',
          name: 'Expired Requests',
          values: [
            {
              x: 10,
              y: '3',
            },
            {
              x: 11,
              y: '3',
            },
            {
              x: 12,
              y: '1',
            },
          ],
        },
        {
          label: 'In Maintenance Requests',
          name: 'In Maintenance Requests',
          values: [
            {
              x: 8,
              y: '1',
            },
            {
              x: 9,
              y: '2',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional user Id' })
  async getRequestStatisticByAdmin(@Query() yearFilterDto: TimeFilterDto, @Query('userId') userId?: number) {
    return await this.requestsService.getRequestStatistic(yearFilterDto, userId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/points/me')
  @ApiOperation({ summary: 'User point statistics ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The data successfully got.',
    example: {
      success: true,
      data: [
        {
          label: 'Recharged point ',
          name: 'Recharged point',
          values: [
            {
              x: 11,
              y: '200000',
            },
            {
              x: 12,
              y: '100000',
            },
          ],
        },
        {
          label: 'Deducted point ',
          name: 'Deducted point',
          values: [
            {
              x: 10,
              y: '-6000',
            },
            {
              x: 11,
              y: '-1000',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getUserPointStatisticsByUser(@Request() req, @Query() timeFilterDto: TimeFilterDto) {
    const userId: number = req.user.id;
    return await this.pointService.getUserPointStatistics(timeFilterDto, userId);
  }

  @Roles(ERoles.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/points')
  @ApiOperation({ summary: 'User point statistics ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The data successfully got.',
    example: {
      success: true,
      data: [
        {
          label: 'Recharged point ',
          name: 'Recharged point',
          values: [
            {
              x: 11,
              y: '200000',
            },
            {
              x: 12,
              y: '100000',
            },
          ],
        },
        {
          label: 'Deducted point ',
          name: 'Deducted point',
          values: [
            {
              x: 10,
              y: '-6000',
            },
            {
              x: 11,
              y: '-1000',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional user Id' })
  async getUserPointStatisticsByAdmin(@Query() timeFilterDto: TimeFilterDto, @Query('userId') userId?: number) {
    return await this.pointService.getUserPointStatistics(timeFilterDto, userId);
  }

  @Roles(ERoles.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get('/learning-files')
  @ApiOperation({ summary: 'Learning files statistic' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get data successfully',
    example: {
      success: true,
      data: [
        {
          name: 'Completed files',
          value: 4,
          label: 'Completed files',
        },
        {
          name: 'Pending files',
          value: 10,
          label: 'Pending files',
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbiden access.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  async getLearningFileStatistics(@Query() timeFilterDto: TimeFilterDto) {
    return this.learningRequestService.getLearningFileStatistics(timeFilterDto);
  }
}
