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
  const useCase = new ExchangeRateUseCase(rateProvider, messageSender);

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
  const useCase = new ExchangeRateUseCase(rateProvider, messageSender);

  await useCase.execute(42, 'USD');

  assert.deepEqual(sentMessages, [{ chatId: 42, text: '1 USD = 1 USD' }]);
});
