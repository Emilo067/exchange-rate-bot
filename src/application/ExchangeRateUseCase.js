import { CurrencyParser } from '../domain/CurrencyParser.js';

export class ExchangeRateUseCase {
  constructor(rateProviders, messageSender) {
    this.rateProviders = rateProviders;
    this.messageSender = messageSender;
  }

  async execute(chatId, text) {
    const currencyCode = CurrencyParser.extractCurrencyCode(text);

    if (!currencyCode) {
      await this.messageSender.sendMessage(
        chatId,
        'Укажите код валюты из 3 букв.',
      );
      return;
    }

    if (currencyCode === 'USD') {
      await this.messageSender.sendMessage(chatId, '1 USD = 1 USD');
      return;
    }

    for (const provider of this.rateProviders) {
      try {
        const rate = await provider.getRate(currencyCode, 'USD');

        if (typeof rate !== 'number') {
          continue;
        }

        await this.messageSender.sendMessage(
          chatId,
          `1 ${currencyCode} = ${rate} USD`,
        );
        return;
      } catch {
        continue;
      }
    }

    await this.messageSender.sendMessage(
      chatId,
      'Не удалось получить курс валюты ни из одного источника.',
    );
  }
}
