// Utility for parsing and normalizing CoinGecko API responses

export interface MarketData {
  price: number;
  change24h?: number;
  marketCap?: number;
}

export interface ParsedMarketResponse {
  success: boolean;
  data?: MarketData;
  error?: string;
}

/**
 * Parse CoinGecko JSON response string into structured market data
 * Handles both successful JSON responses and error text responses
 */
export function parseCoinGeckoResponse(responseText: string): ParsedMarketResponse {
  // Check for deterministic error responses from backend
  if (responseText.startsWith('❌')) {
    return {
      success: false,
      error: responseText,
    };
  }

  try {
    const json = JSON.parse(responseText);
    
    // CoinGecko API returns data in format: { "bitcoin": { "usd": 45000 } }
    // Extract the first (and only) cryptocurrency data
    const cryptoKey = Object.keys(json)[0];
    if (!cryptoKey || !json[cryptoKey]) {
      return {
        success: false,
        error: 'Invalid response format from CoinGecko API',
      };
    }

    const cryptoData = json[cryptoKey];
    
    return {
      success: true,
      data: {
        price: cryptoData.usd || 0,
        change24h: cryptoData.usd_24h_change,
        marketCap: cryptoData.usd_market_cap,
      },
    };
  } catch (error) {
    // If JSON parsing fails, treat as error text
    return {
      success: false,
      error: responseText || 'Failed to parse market data',
    };
  }
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
}

/**
 * Format market cap with appropriate suffix (T/B/M)
 */
export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}
