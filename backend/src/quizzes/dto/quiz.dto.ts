import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateQuestionDto {
  @IsIn(['multiple_choice', 'true_false', 'short_answer'])
  type!: 'multiple_choice' | 'true_false' | 'short_answer';

  @IsString() @MinLength(1) text!: string;

  @IsOptional() @IsArray() options?: string[];

  @IsString() correctAnswer!: string;

  @IsInt() @Min(0) points!: number;
}

export class CreateQuizDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() dueDate!: string;
  @IsOptional() @IsInt() timeLimitMinutes?: number;
  @IsArray() questions!: CreateQuestionDto[];
}

export class SubmitQuizAttemptDto {
  @IsObject() answers!: Record<string, string>;
}
