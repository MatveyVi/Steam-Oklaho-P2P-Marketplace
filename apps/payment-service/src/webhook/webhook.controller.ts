import {
  Controller,
  Post,
  type RawBodyRequest,
  Req,
  Headers,
} from '@nestjs/common';
import Stripe from 'stripe';
import { AppService } from '../app/app.service';
import { ConfigService } from '@nestjs/config';
import { RpcBadRequestException } from '@backend/exceptions';

@Controller('payment/webhook')
export class WebhookController {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  constructor(
    private readonly appService: AppService,
    configService: ConfigService
  ) {
    this.stripe = new Stripe(
      configService.getOrThrow<string>('STRIPE_SECRET_KEY')
    );
    this.webhookSecret = configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET'
    );
  }

  @Post()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    let event: Stripe.Event;
    try {
      if (!req.rawBody) {
        throw new RpcBadRequestException('Нет тела для вебхука Stripe');
      }
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.webhookSecret
      );
    } catch (error: any) {
      throw new RpcBadRequestException(
        `Ошибка вебхука, оплата не прошла ${error.message}`
      );
    }
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    if (event.type === 'payment_intent.succeeded') {
      await this.appService.handleSuccessfulPayment(paymentIntent.id);
    } else if (event.type === 'payment_intent.payment_failed') {
      await this.appService.handleFailedPayment(paymentIntent.id);
    }

    return { received: true };
  }
}
