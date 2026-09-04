export class CurrencyParser {
  static extractCurrencyCode(text) {
    const match = text.match(/\b[a-z]{3}\b/i);

    return match ? match[0].toUpperCase() : null;
  }
}
