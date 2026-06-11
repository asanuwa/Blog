import { ApiProperty } from '@nestjs/swagger';

export class NewsletterSubscriptionEntity {
  @ApiProperty({
    description: 'MongoDB ObjectId.',
    example: '665f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Subscribed email address.',
    example: 'reader@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Subscription timestamp.',
    example: '2026-06-10T12:00:00.000Z',
  })
  createdAt: Date;
}
