export class TelegramWebhookController {
  constructor(exchangeRateUseCase) {
    this.exchangeRateUseCase = exchangeRateUseCase;
  }

  async handle(request, reply) {
    const { message } = request.body ?? {};

    if (!message?.text || !message.chat?.id) {
      return reply.send({ ok: true });
    }

    await this.exchangeRateUseCase.execute(message.chat.id, message.text);

    return reply.send({ ok: true });
  }
}
