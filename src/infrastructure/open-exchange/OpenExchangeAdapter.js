import { RateProvider } from '../../application/ports/RateProvider.js';

export class OpenExchangeAdapter extends RateProvider {
  async getRate(base, target) {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);

    if (!response.ok) {
      throw new Error(`Open Exchange API returned  ${response.status}`);
    }

    const json = await response.json();
    const rate = json.rates?.[target];

    if (typeof rate !== 'number') {
      throw new Error(`Rate for ${target} was not found`);
    }

    return rate;
  }
}
