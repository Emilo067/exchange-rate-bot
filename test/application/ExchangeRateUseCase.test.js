import assert from 'node:assert/strict';
import test from 'node:test';

import { ExchangeRateUseCase } from '../../src/application/ExchangeRateUseCase.js';

test('получает курс и отправляет пользователю результат', async () => {
  const sentMessages = [];
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
  const useCase = new ExchangeRateUseCase([rateProvider], messageSender);

  await useCase.execute(42, 'Покажи EUR');

  assert.deepEqual(sentMessages, [{ chatId: 42, text: '1 EUR = 1.25 USD' }]);
});

test('не обращается к провайдеру для USD', async () => {
  const sentMessages = [];
  const rateProvider = {
    getRate: async () => assert.fail('Провайдер не должен вызываться'),
  };
  const messageSender = {
    sendMessage: async (chatId, text) => sentMessages.push({ chatId, text }),
  };
  const useCase = new ExchangeRateUseCase([rateProvider], messageSender);

  await useCase.execute(42, 'USD');

  assert.deepEqual(sentMessages, [{ chatId: 42, text: '1 USD = 1 USD' }]);
});

test('использует следующий провайдер, если предыдущий выдал ошибку', async () => {
  const sentMessages = [];
  const failedProvider = {
    getRate: async () => {
      throw new Error('Source is unavailable');
    },
  };
  const fallbackProvider = {
    getRate: async () => 1.25,
  };
  const messageSender = {
    sendMessage: async (chatId, text) => sentMessages.push({ chatId, text }),
  };
  const useCase = new ExchangeRateUseCase(
    [failedProvider, fallbackProvider],
    messageSender,
  );

  await useCase.execute(42, 'EUR');

  assert.deepEqual(sentMessages, [{ chatId: 42, text: '1 EUR = 1.25 USD' }]);
});

test('сообщает об ошибке, когда ни один провайдер не ответил', async () => {
  const messageSender = {
    sendMessage: async (_chatId, text) => {
      assert.equal(text, 'Не удалось получить курс валюты ни из одного источника.');
    },
  };
  const failedProvider = {
    getRate: async () => {
      throw new Error('Source is unavailable');
    },
  };
  const useCase = new ExchangeRateUseCase([failedProvider], messageSender);

  await useCase.execute(42, 'EUR');
});
