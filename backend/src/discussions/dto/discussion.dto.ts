import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDiscussionPostDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
