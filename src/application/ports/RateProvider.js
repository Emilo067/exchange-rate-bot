export class RateProvider {
  async getRate(_base, _target) {
    throw new Error('RateProvider.getRate() must be implemented');
  }
}
