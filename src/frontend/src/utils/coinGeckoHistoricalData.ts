// Utility for parsing and normalizing CoinGecko historical price data

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
}

export interface ParsedHistoricalResponse {
  success: boolean;
  data?: HistoricalDataPoint[];
  error?: string;
}

/**
 * Parse CoinGecko historical market_chart JSON response into ordered price series
 * Expected format: { "prices": [[timestamp_ms, price], ...] }
 */
export function parseCoinGeckoHistoricalResponse(responseText: string): ParsedHistoricalResponse {
  // Check for deterministic error responses from backend
  if (responseText.startsWith('❌')) {
    return {
      success: false,
      error: responseText,
    };
  }

  try {
    const json = JSON.parse(responseText);
    
    // CoinGecko market_chart API returns: { "prices": [[timestamp, price], ...], "market_caps": [...], "total_volumes": [...] }
    if (!json.prices || !Array.isArray(json.prices)) {
      return {
        success: false,
        error: 'Invalid response format: missing prices array',
      };
    }

    // Transform [[timestamp, price], ...] into { timestamp, price }[]
    const data: HistoricalDataPoint[] = json.prices.map((entry: any) => {
      if (!Array.isArray(entry) || entry.length < 2) {
        throw new Error('Invalid price entry format');
      }
      return {
        timestamp: entry[0],
        price: entry[1],
      };
    });

    // Sort by timestamp ascending (should already be sorted, but ensure it)
    data.sort((a, b) => a.timestamp - b.timestamp);

    if (data.length === 0) {
      return {
        success: false,
        error: 'No historical data available',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    // If JSON parsing fails or data is malformed, treat as error
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse historical data';
    return {
      success: false,
      error: responseText.startsWith('❌') ? responseText : errorMessage,
    };
  }
}
