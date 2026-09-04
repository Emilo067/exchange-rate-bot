import assert from 'node:assert/strict';
import test from 'node:test';

import { TelegramWebhookController } from '../../src/presentation/TelegramWebhookController.js';

function createReply() {
  return {
    payload: null,
    send(payload) {
      this.payload = payload;
      return payload;
    },
  };
}

test('передаёт валидное Telegram-сообщение в use case', async () => {
  const calls = [];
  const controller = new TelegramWebhookController({
    execute: async (chatId, text) => calls.push({ chatId, text }),
  });
  const reply = createReply();

  await controller.handle(
    { body: { message: { chat: { id: 42 }, text: 'EUR' } } },
    reply,
  );

  assert.deepEqual(calls, [{ chatId: 42, text: 'EUR' }]);
  assert.deepEqual(reply.payload, { ok: true });
});

test('подтверждает webhook без сообщения и не вызывает use case', async () => {
  const controller = new TelegramWebhookController({
    execute: async () => assert.fail('Use case не должен вызываться'),
  });
  const reply = createReply();

  await controller.handle({ body: {} }, reply);

  assert.deepEqual(reply.payload, { ok: true });
});
