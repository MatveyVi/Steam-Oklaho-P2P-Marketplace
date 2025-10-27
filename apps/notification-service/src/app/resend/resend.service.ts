import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { SendMailOptions } from '@backend/dto';

@Injectable()
export class ResendMailer {
  private readonly fromEmail: string;
  private readonly resend: Resend;
  private readonly logger = new Logger(ResendMailer.name); // 👈 У тебя не хватало new Logger()

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY')
    );
    this.fromEmail = this.configService.getOrThrow<string>('RESEND_EMAIL');
  }

  /**
   * Приватная обертка для всех писем. Генерирует HTML-каркас со стилями.
   */
  private createEmailWrapper(content: string, title: string): string {
    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #121212;
            color: #E5E5E5;
          }
          .container {
            width: 90%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #1B2838;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #2A3B4C;
          }
          .header {
            padding: 20px 30px;
            text-align: center;
            background-color: #2A3B4C;
          }
          .header h1 {
            margin: 0;
            color: #E5E5E5;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .content h2 {
            color: #E5E5E5;
            font-size: 20px;
          }
          .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #B0B8BF;
          }
          .card {
            background-color: #2A3B4C;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
          }
          .card p {
            margin: 5px 0;
            color: #E5E5E5;
          }
          .card .label {
            color: #B0B8BF;
          }
          .accent {
            color: #FFD700;
            font-weight: bold;
          }
          .danger {
            color: #FF6B6B;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            padding: 12px 25px;
            margin-top: 20px;
            background-color: #FFD700;
            color: #1B2838;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
          }
          .footer {
            padding: 30px;
            text-align: center;
            font-size: 12px;
            color: #5A6A7C;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CS2 Oklaho Market</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} CS2 Oklaho Market. Все права защищены.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendMail(options: SendMailOptions) {
    this.logger.log(`Попытка отправки уведомления ${options.to}`);
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        throw new Error(error.message);
      }
      this.logger.log(`Email успешно отправлен! ID: ${data.id}`);
      return data;
    } catch (error: any) {
      this.logger.error(
        `Ошибка при отправке email: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  // --- Ярлыки Успеха ---

  async sendWelcomeEmail(to: string, nickname: string) {
    const subject = 'Добро пожаловать в CS2 Oklaho Market!';
    const content = `
      <h2>Привет, <span class="accent">${nickname}</span>!</h2>
      <p>Добро пожаловать на нашу P2P площадку. Мы рады, что вы с нами.</p>
      <a href="http://localhost:3000/api/users/me" class="button">Перейти в профиль</a>
    `;
    const html = this.createEmailWrapper(content, 'Добро пожаловать');
    return this.sendMail({ to, subject, html });
  }

  async sendBalanceUpdate(
    to: string,
    type: 'deposit' | 'withdraw',
    amount: number,
    newBalance: number
  ) {
    const isDeposit = type === 'deposit';
    const subject = isDeposit
      ? 'Ваш баланс пополнен'
      : 'Вывод средств выполнен';
    const title = isDeposit ? 'Баланс успешно пополнен' : 'Средства выведены';
    const content = `
      <h2>${title}</h2>
      <p>Операция по вашему счету была успешно завершена.</p>
      <div class="card">
        <p><span class="label">Тип операции:</span> ${
          isDeposit ? 'Пополнение' : 'Вывод'
        }</p>
        <p><span class="label">Сумма:</span> <span class="accent">${amount.toFixed(
          2
        )} $</span></p>
        <hr style="border-color: #5A6A7C; border-top: 0;">
        <p><span class="label">Новый баланс:</span> <strong>${newBalance.toFixed(
          2
        )} $</strong></p>
      </div>
    `;
    const html = this.createEmailWrapper(content, title);
    return this.sendMail({ to, subject, html });
  }

  async sendPurchaseConfirmation(
    to: string,
    itemName: string,
    price: number,
    sellerNickname: string,
    imageUrl: string | null
  ) {
    const subject = 'Вы совершили покупку!';

    // Блок с картинкой будет добавлен, только если imageUrl существует
    const imageBlock = imageUrl
      ? `
      <div style="text-align: center; padding-bottom: 20px; margin-top: 10px;">
        <img 
          src="${imageUrl}" 
          alt="${itemName}" 
          style="max-width: 100%; width: 250px; height: auto; border-radius: 5px; background: #fff; border: 1px solid #5A6A7C;"
        >
      </div>
      `
      : '';

    const content = `
      <h2>Покупка совершена!</h2>
      <p>Вы успешно приобрели предмет <span class="accent">${itemName}</span>.</p>
      <div class="card">
        ${imageBlock} 
        <p><span class="label">Название:</span> <strong>${itemName}</strong></p>
        <p><span class="label">Продавец:</span> ${sellerNickname}</p>
        <p><span class="label">Сумма:</span> <span class="accent">${price.toFixed(
          2
        )} $</span></p>
      </div>
    `;
    const html = this.createEmailWrapper(content, 'Детали покупки');
    return this.sendMail({ to, subject, html });
  }

  async sendSaleNotification(
    to: string,
    itemName: string,
    price: number,
    buyerNickname: string,
    imageUrl: string | null
  ) {
    const subject = 'У вас новая продажа!';

    // Блок с картинкой будет добавлен, только если imageUrl существует
    const imageBlock = imageUrl
      ? `
      <div style="text-align: center; padding-bottom: 20px; margin-top: 10px;">
        <img 
          src="${imageUrl}" 
          alt="${itemName}" 
          style="max-width: 100%; width: 250px; height: auto; border-radius: 5px; background: #fff; border: 1px solid #5A6A7C;"
        >
      </div>
      `
      : '';

    const content = `
      <h2>Предмет продан!</h2>
      <p>Поздравляем! Ваш предмет <span class="accent">${itemName}</span> был куплен.</p>
      <div class="card">
        ${imageBlock}
        <p><span class="label">Название:</span> <strong>${itemName}</strong></p>
        <p><span class="label">Покупатель:</span> ${buyerNickname}</p>
        <p><span class="label">Сумма продажи:</span> <span class="accent">${price.toFixed(
          2
        )} $</span></p>
      </div>
    `;
    const html = this.createEmailWrapper(content, 'Детали продажи');
    return this.sendMail({ to, subject, html });
  }
  async sendPurchaseFailed(
    to: string,
    itemName: string,
    price: number,
    reason: string
  ) {
    const subject = 'Ошибка покупки';
    const content = `
      <h2>Не удалось совершить покупку</h2>
      <p>К сожалению, при попытке покупки <span class="accent">${itemName}</span> произошла ошибка.</p>
      <p class="danger">${reason}</p>
      <div class="card">
        <p><span class="label">Название:</span> <strong>${itemName}</strong></p>
        <p><span class="label">Сумма:</span> <span class="accent">${price.toFixed(
          2
        )} $</span> (возвращено)</p>
      </div>
      <p style="margin-top: 20px;">Средства были полностью возвращены на ваш баланс.</p>
    `;
    const html = this.createEmailWrapper(content, 'Ошибка покупки');
    return this.sendMail({ to, subject, html });
  }

  async sendPayoutFailed(
    to: string,
    itemName: string,
    price: number,
    buyerNickname: string
  ) {
    const subject = 'КРИТИЧЕСКАЯ ОШИБКА: Ошибка зачисления средств';
    const content = `
      <h2 class="danger">Ошибка зачисления средств!</h2>
      <p>Ваш предмет <span class="accent">${itemName}</span> был продан, но при зачислении средств на ваш баланс произошла ошибка.</p>
      <p><strong>Не волнуйтесь:</strong> продажа зарегистрирована, и наша команда уже уведомлена. Мы решим эту проблему в ручном режиме в ближайшее время.</p>
      <div class="card">
        <p><span class="label">Название:</span> <strong>${itemName}</strong></p>
        <p><span class="label">Покупатель:</span> ${buyerNickname}</p>
        <p><span class="label">Сумма (ожидает):</span> <span class="accent">${price.toFixed(
          2
        )} $</span></p>
      </div>
    `;
    const html = this.createEmailWrapper(content, 'Ошибка зачисления');
    return this.sendMail({ to, subject, html });
  }
}
