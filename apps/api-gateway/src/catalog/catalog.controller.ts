import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly httpService: HttpService) {}

  @Get('/items')
  async findAll() {
    const response = await lastValueFrom(this.httpService.get('/items'));
    return response.data;
  }

  @Get('/items/:externalId')
  async findOne(@Param('externalId') externalId: string) {
    const response = await lastValueFrom(
      this.httpService.get(`/items/${externalId}`)
    );
    return response.data;
  }
}
