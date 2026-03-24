import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'Confirms the API server is running.',
    schema: {
      type: 'string',
      example: 'BudgetFlow API is running.',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
