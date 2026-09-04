export class MessageSender {
  async sendMessage(_chatId, _text) {
    throw new Error('MessageSender.sendMessage() must be implemented');
  }
}
