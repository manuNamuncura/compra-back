import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SupermarketsService } from './supermarkets.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';
import { UpdateSupermarketDto } from './dto/update-supermarket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('supermarkets')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SupermarketsController {
  constructor(private readonly supermarketsService: SupermarketsService) {}

  @Post()
  @Permissions('supermarket:create')
  create(@Body() createSupermarketDto: CreateSupermarketDto) {
    return this.supermarketsService.create(createSupermarketDto);
  }

  @Get()
  @Permissions('supermarket:read')
  findAll() {
    return this.supermarketsService.findAll();
  }

  @Get(':id')
  @Permissions('supermarket:read')
  findOne(@Param('id') id: string) {
    return this.supermarketsService.findOne(+id);
  }

  @Get(':id/products')
  @Permissions('supermarket:read')
  getProducts(@Param('id') id: string) {
    return this.supermarketsService.getProducts(+id);
  }

  @Patch(':id')
  @Permissions('supermarket:update')
  update(@Param('id') id: string, @Body() updateSupermarketDto: UpdateSupermarketDto) {
    return this.supermarketsService.update(+id, updateSupermarketDto);
  }

  @Delete(':id')
  @Permissions('supermarket:delete')
  remove(@Param('id') id: string) {
    return this.supermarketsService.remove(+id);
  }
}