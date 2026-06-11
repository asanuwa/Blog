import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNewsletterSubscriptionDto {
  @ApiProperty({
    description: 'Email address to subscribe to the newsletter.',
    example: 'reader@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
