import { SetMetadata } from '@nestjs/common';
import type { PermissionName } from './types/permissions.type';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionName[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
