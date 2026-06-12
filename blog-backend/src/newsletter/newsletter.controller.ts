import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { NewsletterSubscriptionEntity } from './entities/newsletter-subscription.entity';
import { NewsletterService } from './newsletter.service';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subscribe to the newsletter',
    description: 'Stores a reader email address for future newsletter updates.',
  })
  @ApiBody({
    type: CreateNewsletterSubscriptionDto,
  })
  @ApiCreatedResponse({
    description: 'Newsletter subscription created successfully.',
    type: NewsletterSubscriptionEntity,
  })
  @ApiBadRequestResponse({
    description: 'Invalid email or duplicate subscription.',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'This email is already subscribed to the newsletter.',
        timestamp: '2026-06-10T12:00:00.000Z',
      },
    },
  })
  async subscribe(
    @Body() createSubscriptionDto: CreateNewsletterSubscriptionDto,
  ) {
    return await this.newsletterService.subscribe(createSubscriptionDto);
  }
}
