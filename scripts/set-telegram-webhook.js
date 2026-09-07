export async function setTelegramWebhook({ token, baseUrl }) {
  if (!token) {
    throw new Error('Переменная TELEGRAM_TOKEN не найдена в .env');
  }

  if (!baseUrl) {
    throw new Error('URL для webhook не указан');
  }

  const url = new URL(baseUrl);

  if (url.protocol !== 'https:') {
    throw new Error('URL для webhook должен использовать HTTPS');
  }

  const webhookUrl = new URL('/webhook', url.origin).toString();
  const telegramUrl = `https://api.telegram.org/bot${token}/setWebhook`;
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: webhookUrl }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(
      result.description ?? `Telegram API вернул статус ${response.status}`,
    );
  }

  return {
    webhookUrl,
    description: result.description,
  };
}
