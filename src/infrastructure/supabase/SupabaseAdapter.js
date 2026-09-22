import { createClient } from '@supabase/supabase-js';

import { InteractionRepository } from '../../application/ports/InteractionRepository.js';

export class SupabaseAdapter extends InteractionRepository {
  constructor(url, key) {
    super();
    this.supabase = createClient(url, key);
  }

  async saveInteraction(chat, text, sender) {
    const { error: clientError } = await this.supabase
      .from('clients')
      .upsert({
        id: chat.id,
        first_name: chat.first_name ?? null,
        username: chat.username ?? null,
        last_message_at: new Date().toISOString(),
      });

    if (clientError) {
      throw new Error(`Could not save client: ${clientError.message}`);
    }

    const { error: messageError } = await this.supabase
      .from('messages')
      .insert({
        id: crypto.randomUUID(),
        client_id: chat.id,
        sender,
        text,
        created_at: new Date().toISOString(),
      });

    if (messageError) {
      throw new Error(`Could not save message: ${messageError.message}`);
    }
  }
}
