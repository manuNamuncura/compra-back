import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { PermissionGuard } from "src/common/guards/permissions.guard";
import { RoleService } from "./role.service";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { RoleResponseDto } from "./dto/role-response.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get()
    @Permissions('role:read' as PermissionName)
    async findAll(): Promise<RoleResponseDto[]> {
        return this.roleService.findAll();
    }

    @Get(':id')
    @Permissions('role:read' as PermissionName)
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoleResponseDto> {
        return this.roleService.findOne(id);
    }

    @Get(':id/users')
    @Permissions('role:read' as PermissionName)
    async getRoleUsers(@Param('id', ParseUUIDPipe) id: string) {
        return this.roleService.getRoleUsers(id);
    }

    @Post()
    @Permissions('role:create' as PermissionName)
    async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
        return this.roleService.create(createRoleDto);
    }

    @Patch(':id')
    @Permissions('role:update' as PermissionName)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() assignPermissionDto: AssignPermissionsDto,
    ): Promise<RoleResponseDto> {
        return this.roleService.assignPermissions(id, assignPermissionDto);
    }

    @Patch(':id/permissions')
    @Permissions('role:update' as PermissionName)
    async assignPermissions(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() assignPermissionsDto: AssignPermissionsDto,
    ): Promise<RoleResponseDto> {
        return this.roleService.assignPermissions(id, assignPermissionsDto);
    }

    @Delete(':id')
    @Permissions('role:delete' as PermissionName)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        await this.roleService.remove(id);
        return { message: `Role with ID ${id} deleted successfully` };
    }
}