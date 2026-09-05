<script>
  import { onMount } from 'svelte';

  const RATE_API = 'https://open.er-api.com/v6/latest';

  let currencyInput = 'EUR';
  let displayedCurrency = '';
  let rate = null;
  let state = 'idle';
  let errorMessage = '';
  let waveKey = 0;

  onMount(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  });

  async function loadRate() {
    const baseCurrency = currencyInput.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(baseCurrency)) {
      state = 'error';
      rate = null;
      errorMessage = 'Введите трёхбуквенный код валюты, например EUR.';
      waveKey += 1;
      return;
    }

    state = 'loading';
    errorMessage = '';
    rate = null;
    waveKey += 1;
    displayedCurrency = baseCurrency;

    try {
      if (baseCurrency === 'USD') {
        rate = 1;
      } else {
        const response = await fetch(`${RATE_API}/${baseCurrency}`);

        if (!response.ok) {
          throw new Error('Rate provider is unavailable');
        }

        const data = await response.json();
        const nextRate = data.rates?.USD;

        if (typeof nextRate !== 'number') {
          throw new Error('Rate was not found');
        }

        rate = nextRate;
      }

      state = 'success';
    } catch {
      state = 'error';
      errorMessage = 'Не удалось получить курс. Попробуйте ещё раз.';
    }
  }

  function formatRate(value) {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  }

  function updateCurrency(event) {
    currencyInput = event.currentTarget.value
      .replace(/[^a-z]/gi, '')
      .slice(0, 3)
      .toUpperCase();
    state = 'idle';
  }
</script>

<svelte:head>
  <title>Rate Wave</title>
</svelte:head>

<main class="app-shell">
  <section class="card" aria-label="Проверка курса валют">
    <header class="header">
      <div class="logo" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M24 4 42 14v20L24 44 6 34V14z" fill="currentColor" opacity=".18" />
          <path d="M14 29.5 21 22l5 5 9-10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
          <path d="M30.5 17H35v4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" />
        </svg>
      </div>
      <div>
        <p class="eyebrow">TELEGRAM MINI APP</p>
        <h1>Rate Wave</h1>
        <p class="subtitle">Курс валюты к доллару США</p>
      </div>
    </header>

    <div class="currency-section">
      <label class="section-label" for="currency-code">Код валюты</label>
      <div class="currency-input-wrapper">
        <input
          id="currency-code"
          class="currency-input"
          value={currencyInput}
          maxlength="3"
          inputmode="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          aria-describedby="currency-hint"
          on:input={updateCurrency}
        />
        <span class="currency-target">→ USD</span>
      </div>
      <p id="currency-hint" class="currency-hint">Например: EUR, GBP, JPY или BYN</p>
    </div>

    <button class="primary-button" type="button" on:click={loadRate} disabled={state === 'loading'}>
      {state === 'loading' ? 'Ищем лучший курс…' : 'Узнать курс'}
      <span aria-hidden="true">→</span>
    </button>

    <div class:visible={state !== 'idle'} class="result-area" aria-live="polite">
      {#if state === 'success'}
        <p class="result-label">Текущий ориентир</p>
        <p class="rate">1 {displayedCurrency} <span>=</span> {formatRate(rate)} USD</p>
        <p class="provider">Данные: Open Exchange Rates API</p>
      {:else if state === 'error'}
        <p class="error-message">{errorMessage}</p>
      {:else}
        <p class="loading-message">Подключаемся к источнику курса…</p>
      {/if}

      {#key waveKey}
        <svg
          class:playing={state === 'loading'}
          class="wave"
          viewBox="0 0 320 56"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-gradient" x1="0" x2="1">
              <stop offset="0" stop-color="var(--tg-theme-button-color, #3390ec)" stop-opacity=".2" />
              <stop offset=".5" stop-color="var(--tg-theme-button-color, #3390ec)" stop-opacity="1" />
              <stop offset="1" stop-color="var(--tg-theme-button-color, #3390ec)" stop-opacity=".2" />
            </linearGradient>
          </defs>
          <path class="wave-line line-one" d="M0 28 C20 28, 25 8, 45 8 S70 48, 90 48 S115 12, 135 12 S160 43, 180 43 S205 5, 225 5 S250 47, 270 47 S295 28, 320 28" />
          <path class="wave-line line-two" d="M0 28 C20 28, 25 42, 45 42 S70 10, 90 10 S115 45, 135 45 S160 15, 180 15 S205 50, 225 50 S250 11, 270 11 S295 28, 320 28" />
        </svg>
      {/key}
    </div>
  </section>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    min-width: 320px;
    color: var(--tg-theme-text-color, #17212b);
    background:
      radial-gradient(circle at 12% 5%, color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 16%, transparent), transparent 28rem),
      var(--tg-theme-bg-color, #f4f6fb);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .app-shell {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 20px;
  }

  .card {
    width: min(100%, 430px);
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--tg-theme-text-color, #17212b) 10%, transparent);
    border-radius: 28px;
    background: color-mix(in srgb, var(--tg-theme-secondary-bg-color, #fff) 92%, transparent);
    box-shadow: 0 18px 48px rgb(0 0 0 / 12%);
    padding: 24px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
  }

  .logo {
    display: grid;
    width: 54px;
    height: 54px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 18px;
    color: var(--tg-theme-button-color, #3390ec);
    background: color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 12%, transparent);
  }

  .logo svg {
    width: 40px;
    height: 40px;
  }

  .eyebrow,
  .section-label,
  .result-label,
  .provider {
    margin: 0;
    color: var(--tg-theme-hint-color, #708499);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  h1 {
    margin: 2px 0 0;
    font-size: 24px;
    letter-spacing: -.03em;
  }

  .subtitle {
    margin: 2px 0 0;
    color: var(--tg-theme-hint-color, #708499);
    font-size: 14px;
  }

  .currency-input-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    border: 1px solid color-mix(in srgb, var(--tg-theme-text-color, #17212b) 11%, transparent);
    border-radius: 14px;
    padding: 4px 12px;
    background: color-mix(in srgb, var(--tg-theme-secondary-bg-color, #fff) 82%, transparent);
  }

  .currency-input {
    width: 100%;
    min-width: 0;
    min-height: 46px;
    border: 0;
    color: var(--tg-theme-text-color, #17212b);
    background: transparent;
    font: inherit;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: .08em;
    outline: none;
  }

  .currency-input:focus-visible {
    outline: 2px solid var(--tg-theme-button-color, #3390ec);
    outline-offset: -2px;
    border-radius: 8px;
  }

  .currency-target {
    flex: 0 0 auto;
    color: var(--tg-theme-hint-color, #708499);
    font-size: 13px;
    font-weight: 700;
  }

  .currency-hint {
    margin: 7px 2px 0;
    color: var(--tg-theme-hint-color, #708499);
    font-size: 12px;
  }

  .primary-button {
    display: flex;
    width: 100%;
    min-height: 54px;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
    border: 0;
    border-radius: 16px;
    padding: 0 18px 0 20px;
    color: var(--tg-theme-button-text-color, #fff);
    background: var(--tg-theme-button-color, #3390ec);
    box-shadow: 0 12px 26px color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 32%, transparent);
    cursor: pointer;
    font: inherit;
    font-weight: 750;
    transition: filter .18s ease, transform .18s ease;
  }

  .primary-button span {
    font-size: 23px;
    line-height: 1;
  }

  .primary-button:hover:not(:disabled) {
    filter: brightness(1.06);
  }

  .primary-button:active:not(:disabled) {
    transform: translateY(1px) scale(.99);
  }

  .primary-button:disabled {
    cursor: wait;
    opacity: .75;
  }

  .result-area {
    min-height: 0;
    max-height: 0;
    margin-top: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height .35s ease, margin .35s ease, opacity .25s ease;
  }

  .result-area.visible {
    max-height: 180px;
    margin-top: 22px;
    opacity: 1;
  }

  .rate {
    margin: 6px 0 3px;
    font-size: clamp(24px, 8vw, 34px);
    font-weight: 800;
    letter-spacing: -.045em;
  }

  .rate span {
    color: var(--tg-theme-hint-color, #708499);
    font-weight: 400;
  }

  .provider {
    letter-spacing: .02em;
    text-transform: none;
  }

  .loading-message,
  .error-message {
    min-height: 30px;
    margin: 0;
    color: var(--tg-theme-hint-color, #708499);
    font-size: 14px;
  }

  .error-message {
    color: #e35d6a;
    font-weight: 600;
  }

  .wave {
    display: block;
    width: 100%;
    height: 50px;
    margin-top: 8px;
    overflow: visible;
  }

  .wave-line {
    fill: none;
    stroke: url(#wave-gradient);
    stroke-linecap: round;
    stroke-width: 2.4;
    transform-origin: center;
    animation: breathe 2.6s ease-in-out infinite;
  }

  .line-two {
    animation-delay: -.7s;
    opacity: .45;
  }

  .wave.playing .wave-line {
    animation-duration: .72s;
  }

  @keyframes breathe {
    0%, 100% { opacity: .25; transform: scaleY(.55); }
    50% { opacity: 1; transform: scaleY(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .wave-line,
    .wave.playing .wave-line,
    .result-area,
    .currency-input,
    .primary-button {
      animation: none;
      transition: none;
    }
  }
</style>
