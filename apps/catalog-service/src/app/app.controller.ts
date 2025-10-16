import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('items')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async findAll() {
    return this.appService.findAll();
  }

  @Get('by-ids')
  async findManyByIds(@Query('ids') ids: string) {
    const idsSplitted = ids.split(',');
    const idArray = Array.isArray(idsSplitted) ? idsSplitted : [idsSplitted];
    return this.appService.findManyByIds(idArray);
  }

  @Get(':externalId')
  async findOne(@Param('externalId') externalId: string) {
    const item = await this.appService.findByExternalId(externalId);
    if (!item)
      throw new NotFoundException('Предмет с таким externalId не найден');
    return item;
  }

  @MessagePattern('catalog.find-by-external-id.v1')
  async findByExternalId(@Payload() externalId: string) {
    return this.appService.findByExternalId(externalId);
  }
}
