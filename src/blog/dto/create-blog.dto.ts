import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Blog post title. A URL slug is generated from this value.',
    example: 'Building a REST API with NestJS',
    minLength: 5,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({
    description: 'Main blog post content.',
    example:
      'This post explains how to structure a scalable REST API with NestJS, Prisma, and MongoDB.',
    minLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  content: string;

  @ApiProperty({
    description: 'Name of the blog post author.',
    example: 'Ben',
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiPropertyOptional({
    description: 'Cover image URL for the blog post.',
    example: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true, require_tld: false })
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description:
      'Estimated reading time in minutes. If omitted, the API calculates it from the content.',
    example: 4,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readingTimeMinutes?: number;

  @ApiPropertyOptional({
    description: 'Publication status. Defaults to false when omitted.',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
