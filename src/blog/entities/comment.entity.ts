import { ApiProperty } from '@nestjs/swagger';

export class CommentEntity {
  @ApiProperty({
    description: 'MongoDB ObjectId for the comment.',
    example: '665f1f77bcf86cd799439012',
  })
  id: string;

  @ApiProperty({
    description: 'Comment text.',
    example: 'This was a helpful read. Thanks for sharing it.',
  })
  text: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the blog post this comment belongs to.',
    example: '665f1f77bcf86cd799439011',
  })
  blogId: string;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-06-03T12:20:00.000Z',
  })
  createdAt: Date;
}
