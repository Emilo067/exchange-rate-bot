import assert from 'node:assert/strict';
import test from 'node:test';

import { ExchangeRateUseCase } from '../../src/application/ExchangeRateUseCase.js';

const chat = { id: 42, first_name: 'Ada', username: 'ada' };

function createInteractionRepository() {
  const interactions = [];
  return {
    interactions,
    saveInteraction: async (savedChat, text, sender) => {
      interactions.push({ chat: savedChat, text, sender });
    },
  };
}

test('gets a rate, replies, and records both messages', async () => {
  const sentMessages = [];
  const interactionRepository = createInteractionRepository();
  const rateProvider = {
    getRate: async (base, target) => {
      assert.equal(base, 'EUR');
      assert.equal(target, 'USD');
      return 1.25;
    },
  };
  const messageSender = {
    sendMessage: async (chatId, text) => sentMessages.push({ chatId, text }),
  };
  const useCase = new ExchangeRateUseCase(
    [rateProvider],
    messageSender,
    interactionRepository,
  );

  await useCase.execute(chat, 'Show EUR');

  assert.deepEqual(sentMessages, [{ chatId: 42, text: '1 EUR = 1.25 USD' }]);
  assert.deepEqual(interactionRepository.interactions, [
    { chat, text: 'Show EUR', sender: 'client' },
    { chat, text: '1 EUR = 1.25 USD', sender: 'bot' },
  ]);
});

test('does not call providers for USD', async () => {
  const interactionRepository = createInteractionRepository();
  const rateProvider = {
    getRate: async () => assert.fail('The provider must not be called'),
  };
  const sentMessages = [];
  const useCase = new ExchangeRateUseCase(
    [rateProvider],
    { sendMessage: async (chatId, text) => sentMessages.push({ chatId, text }) },
    interactionRepository,
  );

  await useCase.execute(chat, 'USD');

  assert.deepEqual(sentMessages, [{ chatId: 42, text: '1 USD = 1 USD' }]);
});

test('uses a fallback provider after the first fails', async () => {
  const interactionRepository = createInteractionRepository();
  const useCase = new ExchangeRateUseCase(
    [
      { getRate: async () => { throw new Error('Source is unavailable'); } },
      { getRate: async () => 1.25 },
    ],
    { sendMessage: async () => {} },
    interactionRepository,
  );

  await useCase.execute(chat, 'EUR');

  assert.equal(interactionRepository.interactions[1].text, '1 EUR = 1.25 USD');
});
