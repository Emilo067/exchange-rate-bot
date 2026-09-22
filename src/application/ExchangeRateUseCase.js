import { CurrencyParser } from '../domain/CurrencyParser.js';

export class ExchangeRateUseCase {
  constructor(rateProviders, messageSender, interactionRepository) {
    this.rateProviders = rateProviders;
    this.messageSender = messageSender;
    this.interactionRepository = interactionRepository;
  }

  async execute(chat, text) {
    await this.interactionRepository.saveInteraction(chat, text, 'client');

    const currencyCode = CurrencyParser.extractCurrencyCode(text);
    let replyText = 'Не удалось получить курс валюты ни из одного источника.';

    if (!currencyCode) {
      replyText = 'Укажите код валюты из 3 букв.';
    } else if (currencyCode === 'USD') {
      replyText = '1 USD = 1 USD';
    } else {
      for (const provider of this.rateProviders) {
        try {
          const rate = await provider.getRate(currencyCode, 'USD');
          if (typeof rate === 'number') {
            replyText = `1 ${currencyCode} = ${rate} USD`;
            break;
          }
        } catch {
          // Try the next provider.
        }
      }
    }

    await this.messageSender.sendMessage(chat.id, replyText);
    await this.interactionRepository.saveInteraction(chat, replyText, 'bot');
  }
}
