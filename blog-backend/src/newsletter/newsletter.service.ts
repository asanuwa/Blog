import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(createSubscriptionDto: CreateNewsletterSubscriptionDto) {
    try {
      return await this.prisma.newsletterSubscription.create({
        data: {
          email: createSubscriptionDto.email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This email is already subscribed to the newsletter.',
        );
      }

      throw error;
    }
  }
}
