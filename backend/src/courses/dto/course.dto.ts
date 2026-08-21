import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateCourseDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() @MinLength(1) description!: string;
  @IsString() @MinLength(1) syllabus!: string;
  @IsString() @MinLength(1) category!: string;
  @IsOptional() @IsString() coverImageUrl?: string;
}

export class UpdateCourseDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() syllabus?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
}

export class CreateModuleDto {
  @IsString() @MinLength(1) title!: string;
  @IsInt() @Min(1) order!: number;
}

export class CreateLessonDto {
  @IsString() title!: string;
  @IsString() type!: 'video' | 'text' | 'pdf';
  @IsInt() @Min(1) order!: number;
  @IsString() content!: string;
  @IsOptional() @IsInt() durationMinutes?: number;
}

export class UpdateLessonDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() type?: 'video' | 'text' | 'pdf';
  @IsOptional() @IsInt() @Min(1) order?: number;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsInt() durationMinutes?: number;
}
