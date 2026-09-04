import { RateProvider } from '../../application/ports/RateProvider.js';

export class FrankfurterAdapter extends RateProvider {
  async getRate(base, target) {
    try {
      const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${target}`,
      );

      if (!response.ok) {
        throw new Error(`Frankfurter API returned ${response.status}`);
      }

      const json = await response.json();
      const rate = json.rates?.[target];

      if (typeof rate !== 'number') {
        throw new Error('Currency rate was not found');
      }

      return rate;
    } catch {
      return null;
    }
  }
}
