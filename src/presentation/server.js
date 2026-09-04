import 'dotenv/config';

import fastify from 'fastify';

import { ExchangeRateUseCase } from '../application/ExchangeRateUseCase.js';
import { FrankfurterAdapter } from '../infrastructure/frankfurter/FrankfurterAdapter.js';
import { TelegramAdapter } from '../infrastructure/telegram/TelegramAdapter.js';

const frankfurterAdapter = new FrankfurterAdapter();
const telegramAdapter = new TelegramAdapter(process.env.TELEGRAM_TOKEN);
const exchangeRateUseCase = new ExchangeRateUseCase(
  frankfurterAdapter,
  telegramAdapter,
);

const app = fastify({ logger: true });

app.post('/webhook', async (request, reply) => {
  const { message } = request.body;

  if (!message || !message.text || !message.chat?.id) {
    return reply.send({ ok: true });
  }

  await exchangeRateUseCase.execute(message.chat.id, message.text);

  return reply.send({ ok: true });
});

async function start() {
  await app.listen({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  });
}

start();
