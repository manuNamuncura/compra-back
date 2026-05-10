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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions('category:create')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Permissions('category:read')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Permissions('category:read')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Get(':id/products')
  @Permissions('category:read')
  getProducts(@Param('id') id: string) {
    return this.categoriesService.getProducts(+id);
  }

  @Patch(':id')
  @Permissions('category:update')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Permissions('category:delete')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
