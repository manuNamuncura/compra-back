// purchases/purchases.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @Permissions('purchase:create')
  async create(@Req() req, @Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(
      req.user.id,
      req.user.roles,
      createPurchaseDto,
    );
  }

  @Get()
  @Permissions('purchase:read')
  async findAll(@Req() req) {
    return this.purchasesService.findAll(req.user.id, req.user.roles);
  }

  @Get('stats')
  @Permissions('purchase:read')
  async getUserStats(@Req() req) {
    return this.purchasesService.getUserStats(req.user.id);
  }

  @Get(':id')
  @Permissions('purchase:read')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.purchasesService.findOne(+id, req.user.id, req.user.roles);
  }
}
