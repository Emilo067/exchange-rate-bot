import { CurrencyParser } from '../domain/CurrencyParser.js';

export class ExchangeRateUseCase {
  constructor(rateProvider, messageSender) {
    this.rateProvider = rateProvider;
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

    try {
      const rate = await this.rateProvider.getRate(currencyCode, 'USD');

      if (rate !== null && rate !== undefined) {
        await this.messageSender.sendMessage(
          chatId,
          `1 ${currencyCode} = ${rate} USD`,
        );
        return;
      }
    } catch {
      // Ошибка провайдера обрабатывается единым сообщением ниже.
    }

    await this.messageSender.sendMessage(
      chatId,
      'Не удалось получить курс валюты.',
    );
  }
}
