import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateAssignmentDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() description!: string;
  @IsString() dueDate!: string; // ISO string
  @IsInt() @Min(0) pointsPossible!: number;
  @IsString() submissionType!: 'text' | 'file';
}

export class SubmitAssignmentDto {
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() fileUrl?: string;
}

export class GradeSubmissionDto {
  @IsInt() @Min(0) score!: number;
  @IsOptional() @IsString() feedback?: string;
}
