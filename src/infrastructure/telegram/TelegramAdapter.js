import { MessageSender } from '../../application/ports/MessageSender.js';

export class TelegramAdapter extends MessageSender {
  constructor(token) {
    super();
    this.token = token;
  }

  async sendMessage(chatId, text) {
    return fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });
  }
}
