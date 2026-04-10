import { UserRole } from '@repo/database';
import { IsEnum } from 'class-validator';

export class SetRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
