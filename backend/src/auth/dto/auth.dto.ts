import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

// Loose E.164-ish phone validation: optional leading +, 8-15 digits total.
// Kept as a simple regex (rather than a full phone-parsing library) so
// number formats aren't over-constrained by country.
const PHONE_PATTERN = /^\+?[0-9]{8,15}$/;

export class LoginDto {
  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number.' })
  phone!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class SignUpDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number.' })
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @IsEnum(Role)
  role!: Role;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword!: string;
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UserInitiatedChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword!: string;
}

export class ForgotPasswordDto {
  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number.' })
  phone!: string;
}

export class ResetPasswordDto {
  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number.' })
  phone!: string;

  @IsString()
  @MinLength(4, { message: 'Enter the 6-digit code' }) // Using 4-6 for simplicity in demo
  code!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword!: string;
}
