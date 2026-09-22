import 'dotenv/config';

import { ExchangeRateUseCase } from '../application/ExchangeRateUseCase.js';
import { FrankfurterAdapter } from '../infrastructure/frankfurter/FrankfurterAdapter.js';
import { OpenExchangeAdapter } from '../infrastructure/open-exchange/OpenExchangeAdapter.js';
import { TelegramAdapter } from '../infrastructure/telegram/TelegramAdapter.js';
import { SupabaseAdapter } from '../infrastructure/supabase/SupabaseAdapter.js';
import { createServer } from '../presentation/server.js';
import { TelegramWebhookController } from '../presentation/TelegramWebhookController.js';

const rateProviders = [
  new FrankfurterAdapter(),
  new OpenExchangeAdapter(),
];
const messageSender = new TelegramAdapter(process.env.TELEGRAM_TOKEN);
const interactionRepository = new SupabaseAdapter(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const exchangeRateUseCase = new ExchangeRateUseCase(
  rateProviders,
  messageSender,
  interactionRepository,
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
