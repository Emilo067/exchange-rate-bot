import 'dotenv/config';
import localtunnel from 'localtunnel';

import { setTelegramWebhook } from './set-telegram-webhook.js';

const port = 5173;
const token = process.env.TELEGRAM_TOKEN;
const productionUrl = process.env.PRODUCTION_URL;

let tunnel;
let isClosing = false;

async function restoreProductionWebhook() {
  const result = await setTelegramWebhook({
    token,
    baseUrl: productionUrl,
  });

  console.log(`Webhook возвращён на Vercel: ${result.webhookUrl}`);
  console.log(`Telegram: ${result.description}`);
}

async function shutdown(reason) {
  if (isClosing) {
    return;
  }

  isClosing = true;
  console.log(`${reason}. Возвращаем webhook на Vercel…`);

  try {
    await restoreProductionWebhook();
  } catch (error) {
    console.error(`Не удалось вернуть webhook на Vercel: ${error.message}`);
    console.error('Выполните вручную: pnpm webhook:prod');
    process.exitCode = 1;
  } finally {
    tunnel?.close();
  }
}

async function start() {
  if (!token) {
    throw new Error('Переменная TELEGRAM_TOKEN не найдена в .env');
  }

  if (!productionUrl) {
    throw new Error('Переменная PRODUCTION_URL не найдена в .env');
  }

  tunnel = await localtunnel({ port });

  const tunnelClosed = new Promise((resolve) => {
    tunnel.once('close', () => {
      if (isClosing) {
        console.log('LocalTunnel закрыт.');
        resolve();
      } else {
        console.error('LocalTunnel неожиданно закрылся.');
        process.exitCode = 1;
        isClosing = true;

        restoreProductionWebhook()
          .catch((error) => {
            console.error(
              `Не удалось вернуть webhook на Vercel: ${error.message}`,
            );
          })
          .finally(resolve);
      }
    });
  });

  tunnel.on('error', (error) => {
    console.error(`Ошибка LocalTunnel: ${error.message}`);
    process.exitCode = 1;
    void shutdown('Ошибка соединения');
  });

  process.once('SIGINT', () => void shutdown('Получен Ctrl+C'));
  process.once('SIGTERM', () => void shutdown('Получен SIGTERM'));

  console.log(`LocalTunnel запущен: ${tunnel.url}`);
  const result = await setTelegramWebhook({
    token,
    baseUrl: tunnel.url,
  });
  console.log(`Локальный webhook установлен: ${result.webhookUrl}`);
  console.log(`Telegram: ${result.description}`);
  console.log('Туннель остаётся открытым. Для остановки нажмите Ctrl+C.');

  await tunnelClosed;
}

start().catch((error) => {
  console.error(`Не удалось запустить туннель: ${error.message}`);
  process.exitCode = 1;

  if (tunnel) {
    void shutdown('Ошибка запуска');
  }
});
