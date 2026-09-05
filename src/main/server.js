import 'dotenv/config';

import { ExchangeRateUseCase } from '../application/ExchangeRateUseCase.js';
import { FrankfurterAdapter } from '../infrastructure/frankfurter/FrankfurterAdapter.js';
import { OpenExchangeAdapter } from '../infrastructure/open-exchange/OpenExchangeAdapter.js';
import { TelegramAdapter } from '../infrastructure/telegram/TelegramAdapter.js';
import { createServer } from '../presentation/server.js';
import { TelegramWebhookController } from '../presentation/TelegramWebhookController.js';

const rateProviders = [
  new FrankfurterAdapter(),
  new OpenExchangeAdapter(),
];
const messageSender = new TelegramAdapter(process.env.TELEGRAM_TOKEN);
const exchangeRateUseCase = new ExchangeRateUseCase(
  rateProviders,
  messageSender,
);
const webhookController = new TelegramWebhookController(exchangeRateUseCase);
const app = createServer({ webhookController });

async function start() {
  await app.listen({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  });
}

start();
