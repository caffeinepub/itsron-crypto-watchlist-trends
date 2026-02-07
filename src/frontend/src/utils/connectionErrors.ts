/**
 * Utility functions for normalizing and detecting connection/actor errors
 */

/**
 * Detects if an error is related to IC cycle exhaustion
 */
export function isCycleExhaustionError(error: Error | string | null | undefined): boolean {
  if (!error) return false;
  
  const message = typeof error === 'string' ? error : error.message || '';
  const lowerMessage = message.toLowerCase();
  
  return (
    lowerMessage.includes('out of cycles') ||
    lowerMessage.includes('cycles') && lowerMessage.includes('threshold') ||
    message.includes('IC0406') ||
    message.includes('IC0504') ||
    lowerMessage.includes('canister not enough cycles')
  );
}

/**
 * Detects if an error is related to missing or invalid canister configuration
 */
export function isConfigurationError(error: Error | string | null | undefined): boolean {
  if (!error) return false;
  
  const message = typeof error === 'string' ? error : error.message || '';
  const lowerMessage = message.toLowerCase();
  
  return (
    lowerMessage.includes('canister id') ||
    lowerMessage.includes('configuration') ||
    lowerMessage.includes('invalid canister') ||
    lowerMessage.includes('backend not found')
  );
}

/**
 * Normalizes actor creation errors into user-friendly English messages
 */
export function normalizeActorError(error: Error | string | null | undefined): string {
  if (!error) return 'Unknown error occurred';
  
  const message = typeof error === 'string' ? error : error.message || 'Unknown error';
  
  // Check for cycle exhaustion
  if (isCycleExhaustionError(error)) {
    return 'Backend canister is out of cycles. Live data is temporarily unavailable until cycles are topped up. Please contact the administrator.';
  }
  
  // Check for configuration errors
  if (isConfigurationError(error)) {
    return 'Backend configuration error: Unable to locate canister ID. This may occur after clearing site data. Try refreshing the page or re-authenticating.';
  }
  
  // Check for network errors
  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  // Check for timeout
  if (message.toLowerCase().includes('timeout')) {
    return 'Connection timeout: Backend initialization took too long. Please try again.';
  }
  
  // Return original message if no specific pattern matched
  return message;
}

/**
 * Gets a user-friendly error message for cycle exhaustion in watchlist/market data
 */
export function getCycleExhaustionMessage(): string {
  return 'Backend out of cycles - live data temporarily unavailable';
}

/**
 * Gets a generic error message for non-cycle errors
 */
export function getGenericErrorMessage(): string {
  return 'Error loading data';
}
