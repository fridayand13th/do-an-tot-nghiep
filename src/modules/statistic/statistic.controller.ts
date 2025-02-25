import { Controller, Get, HttpStatus, Query, Request, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { ERoles } from 'src/enums/base.enum';
import { AuthRoleGuard } from 'src/common/guards/authenticate.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TimeFilterDto } from 'src/common/dto/common.dto';


@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly usersService: UsersService,
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
    
  }

  
}
