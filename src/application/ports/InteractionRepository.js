export class InteractionRepository {
  async saveInteraction(_chat, _text, _sender) {
    throw new Error('InteractionRepository.saveInteraction() must be implemented');
  }
}
