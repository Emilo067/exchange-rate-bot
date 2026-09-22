import "@supabase/functions-js/edge-runtime.d.ts";

import { ExchangeRateUseCase } from "../../../src/application/ExchangeRateUseCase.js";
import { FrankfurterAdapter } from "../../../src/infrastructure/frankfurter/FrankfurterAdapter.js";
import { OpenExchangeAdapter } from "../../../src/infrastructure/open-exchange/OpenExchangeAdapter.js";
import { TelegramAdapter } from "../../../src/infrastructure/telegram/TelegramAdapter.js";

const TELEGRAM_SECRET_HEADER = "x-telegram-bot-api-secret-token";
const telegramToken = Deno.env.get("TELEGRAM_TOKEN");
const exchangeRateUseCase = new ExchangeRateUseCase(
  [new FrankfurterAdapter(), new OpenExchangeAdapter()],
  new TelegramAdapter(telegramToken ?? ""),
);

function secretMatches(actual: string | null, expected: string): boolean {
  if (!actual || actual.length !== expected.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
    if (!webhookSecret || !telegramToken) {
      console.error("Telegram webhook secrets are not configured");
      return Response.json({ ok: false }, { status: 500 });
    }

    if (!secretMatches(request.headers.get(TELEGRAM_SECRET_HEADER), webhookSecret)) {
      return Response.json({ ok: false }, { status: 401 });
    }

    let update: { message?: { chat?: { id?: number }; text?: string } };
    try {
      update = await request.json();
    } catch {
      return Response.json({ ok: false }, { status: 400 });
    }

    const message = update.message;
    if (!message?.text || typeof message.chat?.id !== "number") {
      return Response.json({ ok: true });
    }

    try {
      await exchangeRateUseCase.execute(message.chat.id, message.text);
      return Response.json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook processing failed", error);
      return Response.json({ ok: false }, { status: 500 });
    }
  },
};
