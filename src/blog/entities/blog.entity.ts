import { ApiProperty } from '@nestjs/swagger';

export class BlogEntity {
  @ApiProperty({
    description: 'MongoDB ObjectId.',
    example: '665f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Blog post title.',
    example: 'Building a REST API with NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Main blog post content.',
    example:
      'This post explains how to structure a scalable REST API with NestJS, Prisma, and MongoDB.',
  })
  content: string;

  @ApiProperty({
    description: 'Blog post author.',
    example: 'Ben',
  })
  author: string;

  @ApiProperty({
    description: 'Cover image URL for the blog post.',
    example: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    required: false,
    nullable: true,
  })
  coverImageUrl?: string | null;

  @ApiProperty({
    description: 'Estimated reading time in minutes.',
    example: 4,
    required: false,
    nullable: true,
  })
  readingTimeMinutes?: number | null;

  @ApiProperty({
    description: 'Number of likes for the blog post.',
    example: 12,
    default: 0,
    required: false,
    nullable: true,
  })
  likes?: number | null;

  @ApiProperty({
    description: 'Number of comments for the blog post.',
    example: 3,
    default: 0,
    required: false,
    nullable: true,
  })
  commentCount?: number | null;

  @ApiProperty({
    description: 'Unique URL-friendly slug generated from the title.',
    example: 'building-a-rest-api-with-nestjs',
  })
  slug: string;

  @ApiProperty({
    description: 'Publication status.',
    example: true,
    default: false,
  })
  published: boolean;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-06-03T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-06-03T12:15:00.000Z',
  })
  updatedAt: Date;
}
