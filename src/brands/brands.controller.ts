import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('brands')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Permissions('brand:create')
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @Permissions('brand:read')
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @Permissions('brand:read')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(+id);
  }

  @Get(':id/products')
  @Permissions('brand:read')
  getProducts(@Param('id') id: string) {
    return this.brandsService.getProducts(+id);
  }

  @Patch(':id')
  @Permissions('brand:update')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(+id, updateBrandDto);
  }

  @Delete(':id')
  @Permissions('brand:delete')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(+id);
  }
}
