import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('items')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async findAll() {
    return this.appService.findAll();
  }

  @Get(':externalId')
  async findOne(@Param('externalId') externalId: string) {
    const item = await this.appService.findByExternalId(externalId);
    if (!item)
      throw new NotFoundException('Предмет с таким externalId не найден');
    return item;
  }
}
