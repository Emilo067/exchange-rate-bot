import 'dotenv/config';

import { setTelegramWebhook } from './set-telegram-webhook.js';

async function start() {
  const result = await setTelegramWebhook({
    token: process.env.TELEGRAM_TOKEN,
    baseUrl: process.env.PRODUCTION_URL,
  });

  console.log(`Production webhook установлен: ${result.webhookUrl}`);
  console.log(`Telegram: ${result.description}`);
}

start().catch((error) => {
  console.error(`Не удалось установить production webhook: ${error.message}`);
  process.exitCode = 1;
});
