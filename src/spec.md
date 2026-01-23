# itsron crypto watchlist trends

## Overview
A cryptocurrency trend forecasting application that allows users to create watchlists and generate statistical predictions based on historical price data automatically fetched from CoinGecko's public REST API with customizable forecasting methods and intelligent alert systems.

## Core Features

### Automatic User Profile Management
- **Silent Profile Creation**: Backend automatically detects logged-in Internet Identity principal during login or profile check and creates user profile silently without showing ProfileSetupModal
- **Automatic Admin Assignment**: Backend automatically assigns the first logged-in Internet Identity principal as admin during profile creation and persists the role across sessions
- **Profile Existence Check**: Frontend checks backend profile existence during login flow - if profile exists, skip ProfileSetupModal and go directly to dashboard
- **Seamless Login Flow**: App checks admin recognition and profile existence automatically, eliminating manual profile setup steps
- **Persistent Profile State**: Once profile is created for an identity, it remains permanently available with proper admin role persistence
- **Enhanced Login Detection**: Backend automatically detects and processes Internet Identity principal during any login or profile check operation
- **Silent Background Processing**: All profile creation and admin assignment happens transparently without user interaction or modal dialogs

### Enhanced Visual Design and Balanced Color Scheme
- **Balanced Visual Theme**: Implement sophisticated color scheme with richer colors but softer contrast for visually "snazzy" yet comfortable appearance
- **Comfortable Brightness Levels**: Use balanced brightness levels that work well across both dark and light modes while maintaining excellent readability
- **Rich Colorful Accent System**: Apply vibrant blue, rich purple, and teal accents strategically throughout the interface for modern, appealing appearance with comfortable contrast
- **Dual Mode Support**: Ensure rich color scheme with balanced brightness applies uniformly across both dark and light modes for header, dashboard elements, dialogs, footer, and all UI components
- **Enhanced Visual Comfort**: Implement comfortable contrast ratios with colorful accents that provide visual appeal without strain
- **Modern Visual Hierarchy**: Create visual harmony through consistent application of the rich but balanced color palette while preserving content clarity
- **Professional Polish**: Maintain polished, professional appearance with the enhanced colorful design and improved visual balance across all lighting conditions

### Cryptocurrency Watchlist Management
- Users can manually add cryptocurrencies to their personal watchlist by entering cryptocurrency names or symbols
- Users can remove cryptocurrencies from their watchlist
- Display a clean list of all tracked cryptocurrencies
- **Complete CoinGecko Instruments Integration**: Backend fetches and caches the complete list of tradable cryptocurrency pairs exclusively from CoinGecko's `/coins/list` endpoint during application startup with comprehensive error handling, retry logic, and immediate availability
- **Enhanced Symbol-to-ID Mapping**: Backend implements correct CoinGecko symbol mappings for major cryptocurrencies including:
  - BTC → bitcoin
  - ETH → ethereum
  - XRP → ripple
  - USDT → tether
  - USDC → usd-coin
  - DOGE → dogecoin
  - ADA → cardano
  - SOL → solana
  - MATIC → polygon
- **Automatic Symbol Loading on Startup**: Backend automatically fetches and caches symbols from CoinGecko API immediately when the canister starts using a system initialization timer to ensure symbols are available from the first user interaction
- **Enhanced Symbol Loading with Stable Variables**: Backend implements stable variable `symbolsInitialized : Bool = false` to track initialization state across canister upgrades
- **Post-Upgrade Symbol Loading**: Backend implements `system func postupgrade()` that checks if `symbolsInitialized` is false, runs `loadSymbolsInternal()`, and then sets `symbolsInitialized := true` to ensure symbols are loaded after canister upgrades
- **Internal Symbol Loading Function**: Backend implements `loadSymbolsInternal()` to populate validSymbols with correct CoinGecko mappings for BTC → bitcoin, ETH → ethereum, USDT → tether, USDC → usd-coin, XRP → ripple, DOGE → dogecoin, ADA → cardano, SOL → solana, MATIC → polygon
- **Debug Symbol Verification**: Backend provides public query function `debugValidSymbols()` that returns `validSymbols.toArray()` to enable verification that symbols are properly mapped to their CoinGecko IDs
- **Immediate Symbol Validation**: Backend validates user-entered symbols against cached CoinGecko instruments dataset immediately upon entry, with cached data available even during fresh instrument list loading
- **Real-Time Symbol Entry**: Users can manually enter any cryptocurrency symbol with immediate validation that works during loading states using cached data and after fresh caching completes
- **Comprehensive JSON Parsing**: Backend implements robust JSON parsing to extract all active trading pairs from CoinGecko's `/coins/list` endpoint response with comprehensive error handling and graceful fallback to cached data
- **Interactive Symbol Dropdown**: AddCryptoDialog displays the complete list of valid cryptocurrency symbols from the cached CoinGecko instruments data as an interactive dropdown when available, with proper loading indicators
- **Enhanced Loading State Management**: Frontend validation shows appropriate loading messages during instruments data fetching, which disappear automatically once data loads successfully or falls back to cached data
- **Complete Static Symbol Elimination**: Remove all references to static symbol lists and replace with dynamic symbol loading exclusively from CoinGecko `/coins/list` endpoint with persistent caching
- **Enhanced Symbol Filtering**: Backend implements comprehensive filtering logic to retain all valid cryptocurrency trading pairs from instruments endpoint with proper validation and error handling
- **Symbol-to-Endpoint Linking**: Ensure that symbols from CoinGecko integration are properly linked to price endpoints for seamless data retrieval with connection verification
- **Immediate Watchlist Updates**: On successful symbol addition, immediately refresh and update the watchlist display so new symbols appear right away
- **Clear Visual Feedback**: Display success or error alerts in the "Add Symbol" dialog after pressing "Add" button with proper error handling for failed API calls and retry options
- **Responsive Dialog Interaction**: Users interact with AddCryptoDialog with both dropdown selection and manual entry options with proper loading and error states
- **Enhanced API Error Handling**: Display clear, user-friendly error messages when CoinGecko API connections fail with proper UI feedback and fallback to cached data when available
- **Live Data Validation**: Backend validation logic accepts user-entered symbols immediately during loading using cached data and after fresh caching completes
- **Universal Symbol Support**: Backend accepts and validates all valid cryptocurrency symbols including TAO, BTC, ETH, SOL, ATOM, and all other tradable instruments from CoinGecko without showing "validation failed" errors, using cached data when fresh data is unavailable

### Enhanced CoinGecko API Integration with mo:serde JSON Parsing and Debug Logging
- **Production HTTP Outcalls with Retry Logic**: Backend implements fully functional HTTP outcalls using working GET requests to CoinGecko API with proper IC `http_request` capability, management canister integration, and exponential backoff retry logic
- **Robust CoinGecko Instruments Integration**: Backend performs HTTP outcalls exclusively to CoinGecko's `/coins/list` endpoint during application startup to fetch the complete list of tradable cryptocurrency pairs with comprehensive error handling and graceful fallback
- **Enhanced mo:serde JSON Parsing Integration**: Backend integrates `mo:serde` package for robust JSON parsing capabilities:
  - Add `mo:serde` package to backend using `mops add serde` command
  - Import `mo:serde/JSON`, `mo:base/Debug`, and `mo:base/Float` into `backend/main.mo`
  - Implement complete `parseCoingeckoResponse` function using `mo:serde` to correctly parse CoinGecko API JSON responses from `/simple/price` endpoint
  - Parse `usd`, `usd_24h_change`, and `usd_market_cap` fields from CoinGecko price endpoint responses with proper error handling
  - Add debug logging with `Debug.print` for raw response and parsing results for troubleshooting
- **Enhanced Instruments JSON Parsing**: Backend implements complete and robust JSON parsing for CoinGecko's `/coins/list` endpoint response using `mo:serde` with comprehensive error handling to extract:
  - All available cryptocurrency symbols and trading pairs from the complete JSON response structure
  - Individual symbol identifiers and cryptocurrency names with validation
  - Symbol status and activity flags to filter out inactive symbols with error handling
  - Complete mapping of all active cryptocurrency pairs for validation and dropdown population
  - Graceful handling of malformed or incomplete JSON responses
- **CoinGecko Price Endpoint Integration with mo:serde**: Backend integrates CoinGecko's simple/price endpoint for live price data with comprehensive JSON parsing using `mo:serde` and error handling to extract:
  - Current price for each cryptocurrency with validation using enhanced `parseCoingeckoResponse` function
  - 24-hour price change percentage with error handling
  - Market cap data for market analysis with fallback values
  - Volume data for trading activity metrics with validation
- **Enhanced CoinGecko Price Data Function**: Backend implements `getLiveMarketData(symbol : Text)` function that performs HTTP GET to CoinGecko's `/simple/price` endpoint with complete URL parameters including `ids`, `vs_currencies=usd`, `include_24hr_change=true`, and `include_market_cap=true`, uses enhanced `parseCoingeckoResponse` function with `mo:serde` to parse the JSON response, and extracts:
  - `price`: current price from ticker entry
  - `change24h`: 24-hour percentage change
  - `marketCap`: market cap data if available, or 0 otherwise
- **Enhanced buildCoinGeckoUrl Function with Debug Logging**: Backend implements `buildCoinGeckoUrl` function that constructs proper CoinGecko API URLs with all required parameters: `ids`, `vs_currencies=usd`, `include_market_cap=true`, and `include_24hr_change=true`, with detailed debug prints to verify symbol-to-ID mapping, printing both the symbol and CoinGecko ID used in each request
- **Debug-Enhanced fetchCoinGeckoData Function**: Backend replaces existing `fetchCoinGeckoData` function with debug-enhanced version that includes comprehensive logging:
  - Logs when called with `🔍 fetchCoinGeckoData called for:` followed by the symbol
  - Logs the full built URL with `📡 Built URL:` followed by the complete CoinGecko API URL
  - Logs the returned raw response with `📥 Got response:` followed by the raw API response text
  - Integrates seamlessly with existing `buildCoinGeckoUrl` and `parseCoingeckoResponse` functions
  - Maintains all existing error handling and retry logic while adding detailed debug output
  - Confirms correct symbol mapping and unique data per coin through comprehensive logging
- **Live Market Data Integration**: Replace or extend existing `getLiveMarketData` function to use the enhanced `parseCoingeckoResponse` function with `mo:serde` JSON parsing, HTTP outcall and caching
- **Debug Logging for Price Data**: Add appropriate `Debug.print` logs for raw response and parsing results in the price data function for troubleshooting
- **Automatic Live Data Retrieval**: Ensure CoinGecko price integration with `mo:serde` parsing runs automatically when a crypto is viewed for live data
- **Advanced Symbol Filtering Logic**: Backend implements sophisticated filtering with error handling to exclude:
  - Inactive or delisted symbols based on status flags with validation
  - Non-cryptocurrency assets where appropriate with proper filtering
  - Duplicate or alternative naming conventions for the same assets
  - Invalid or malformed symbol entries with error logging
- **Persistent Symbol Map Population**: Backend populates comprehensive `validSymbols` map with all filtered active cryptocurrency symbols from parsed CoinGecko instruments data during canister startup, with persistent caching across restarts and intelligent cache management
- **Enhanced Anti-Loop Caching Strategy**: Backend implements intelligent caching strategy with persistent storage that prevents infinite retry loops while ensuring data freshness, availability, and graceful degradation during API outages
- **Live Market Data Integration**: Backend ensures that live price data from CoinGecko's price endpoint works seamlessly with all symbols from the instruments integration, with proper error handling and fallback mechanisms
- **Complete Placeholder Data Elimination**: Replace all placeholder data, "N/A" values, "Historical Data Unavailable" messages, "Backend Integration Pending" notices, and mock responses with actual parsed live data from CoinGecko API using `mo:serde`, with cached fallback data when fresh data is unavailable
- **Universal Symbol Validation**: Backend correctly validates and accepts all valid cryptocurrency symbols present in CoinGecko's instruments dataset including TAO, BTC, ETH, SOL, ATOM, and all other tradable instruments, using cached data when fresh validation is unavailable
- **Real-Time Data Processing**: Backend correctly parses CoinGecko API JSON responses using `mo:serde` to extract all key fields with proper array indexing, comprehensive error handling, and graceful fallback
- **Enhanced Error Handling with UI Feedback**: Comprehensive error handling for API failures, JSON parsing errors, and network issues with clear UI feedback, graceful degradation, and automatic retry mechanisms
- **Rate Limit Management**: Implement proper rate limit handling and retry logic for CoinGecko API with intelligent caching and exponential backoff
- **Verified Symbol-to-Endpoint Connectivity**: Ensure that all symbols from CoinGecko integration can successfully retrieve live prices via price endpoint, with proper error handling and fallback
- **Automatic Symbol Refresh on Deployment**: Backend initialization ensures `initializeCryptoSystem()` or `fetchAndLoadSymbolsFromAPI()` automatically refreshes `validSymbols` upon deployment, ensuring symbols are populated before ticker queries and correctly references the internal symbol map

### Comprehensive Backend Debug Functions for Troubleshooting
- **Debug Symbol Verification**: Implement `debugCheckSymbol(symbol : Text)` function to verify if a specific symbol exists in the `validSymbols` map for troubleshooting symbol validation issues
- **Debug Raw Price Fetch**: Implement `debugFetchRawTicker()` function to execute direct HTTP GET request to `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true` and return raw response text or error string for API connectivity testing
- **Debug Price Response Parsing**: Implement `debugParseTicker(symbol : Text)` function to fetch price endpoint, show response length, and return first 500 characters of response for examination of API response structure
- **Debug Symbol Count**: Implement `debugSymbolCount()` function to return total count of entries in `validSymbols` map for verification of symbol loading completeness
- **Debug CoinGecko API Test**: Implement `debugTestCoinGecko()` function to perform HTTP GET request to `https://api.coingecko.com/api/v3/ping` using `OutCall.httpGetRequest`, returning `"SUCCESS: ..."` if successful or `"ERROR: ..."` with the error message if it fails
- **Debug Valid Symbols Array**: Implement public query function `debugValidSymbols()` that returns `validSymbols.toArray()` to enable verification that symbols are properly mapped to their CoinGecko IDs
- **Debug Admin List**: Implement `debugGetAdminList()` function to return current admin principals for authorization troubleshooting
- **Debug System Reset**: Implement `debugResetSystem()` function that logs intended reset actions without executing them for system state verification
- **Debug Function Integration**: Position debug functions after existing CoinGecko integration code in `backend/main.mo` using `OutCall.httpGetRequest`, `transform`, `Error.message`, and `Text.slice/Nat.toText` for accurate debugging output

### Historical Data Retrieval
- **Production HTTP Outcalls for Historical Data**: Backend implements HTTP outcalls for fetching historical price trends from CoinGecko endpoints with comprehensive error handling and retry logic
- **Real Historical API Endpoints**: Backend implements actual CoinGecko historical API endpoints for fetching historical price data including daily prices for configurable time periods with cached fallback data
- **Historical Data Population**: System populates historical data for forecast charts with actual price data from CoinGecko API, with graceful handling of missing or incomplete data
- Retrieve time-series price data for configurable intervals to support forecasting calculations with error handling
- **Live Historical Data Processing**: Process and store actual historical data from CoinGecko API responses for statistical analysis with comprehensive validation and error handling
- **Comprehensive JSON Parsing for Historical Data**: Backend implements robust JSON parsing for historical data responses from CoinGecko API using `mo:serde` with proper error handling and graceful fallback
- **Complete Historical Data Availability**: All historical data endpoints return actual price history from CoinGecko endpoint with cached fallback data, eliminating "Historical Data Unavailable" messages
- **CoinGecko Historical Data Integration**: Backend fetches historical price data from CoinGecko's historical endpoints for use in market trend and forecast charts with configurable intervals and comprehensive error handling
- **Proper Chart Display**: Frontend displays proper charts based on parsed historical data with cached fallback data instead of "Historical data not available" messages

### Statistical Analysis and Forecasting
- Support multiple prediction methods: linear regression, moving averages, and exponential smoothing
- Users can select their preferred forecasting method for each cryptocurrency
- **Real Data-Based Calculations**: Calculate predictions based on actual historical price data fetched from CoinGecko API via HTTP outcalls, with cached data fallback when fresh data is unavailable
- Generate future price trend estimates using the selected forecasting method with error handling
- **Live API Data Integration**: All computations use real CoinGecko API-sourced historical data from configured HTTP outcalls with graceful fallback to cached data
- **Live Data Forecast Charts**: Frontend forecast charts display live data with accurate predictions based on real historical data from CoinGecko, with cached data support during API outages

### Forecast Customization
- "Forecast Settings" panel allowing users to choose prediction methods per cryptocurrency
- Method selection includes linear regression, moving average, and exponential smoothing
- Real-time visual feedback when forecasting methods are changed
- Intuitive toggling interface for method selection

### Notifications and Alerts System
- Configurable alert thresholds for significant price changes
- Notifications when forecasts deviate from current market price beyond user-defined thresholds
- Alert settings configurable per cryptocurrency symbol
- Real-time monitoring of trend shifts and price movements

### Interactive Data Visualization
- Display interactive charts showing:
  - **Real historical price data**: Fetched from CoinGecko API via HTTP outcalls with cached data support
  - Statistical trend lines based on selected forecasting method
  - Future price predictions using chosen method
  - **Live market price comparison**: Current live market price from CoinGecko price API for comparison with graceful error handling
- Charts should clearly distinguish between historical data and predicted trends
- Real-time chart updates when forecasting methods are changed
- **Historical Data Availability**: Charts display real historical data from successful CoinGecko API calls with cached fallback data

### Dashboard Interface
- Modern, clean dashboard layout with app title "ItsRon Analysis and Predictions" prominently displayed in the header
- Hero section with "ItsRon's" displayed as the primary title in bold, larger font
- Directly underneath the primary title, display the subtitle "Trend Analysis Platform" in smaller and lighter font style
- Hero section maintains centered and balanced layout with consistent design aesthetics
- **Live Data Overview Cards**: Overview cards showing key metrics for each tracked cryptocurrency using actual CoinGecko price API data with proper loading, error states, and cached fallback
- **Real-time API Updates**: Real-time updates of live market data from CoinGecko HTTP outcalls with visual feedback during data fetching and graceful fallback to cached data
- Easy navigation between different cryptocurrencies
- Forecast Settings panel with intuitive controls for method selection and alert configuration
- Consistent branding with the updated application title across all interface elements including browser tab title
- **Working Add Crypto Dialog**: Add crypto dialog with interactive complete symbol dropdown populated from cached CoinGecko instruments data and properly functioning "Add Symbol" button with enhanced error handling and retry options
- **Responsive Button Behavior**: All dialog buttons remain responsive with proper progress indicators, clear status feedback, and error recovery options
- **Enhanced CryptoCard component**: Displays real-time market data from actual CoinGecko price HTTP outcall responses with cached data fallback during API issues
- **Live API Dashboard Integration**: Frontend properly displays actual market data results from CoinGecko price API in both dashboard overview and individual CryptoCard components with graceful error handling
- **Confirmed API Status Display**: Show "CoinGecko API configured and connected" status message when CoinGecko API connection is properly configured and responding with real data, with health monitoring and error reporting
- **Real-Time Price Display**: Dashboard displays live prices for all cryptocurrencies using the linked CoinGecko price data with automatic updates and cached fallback during outages
- **Complete Integration Status**: Eliminate all "Backend Integration Pending" status messages once live CoinGecko instruments integration is successfully implemented and populating, with proper error reporting for integration issues
- **Enhanced Loading State Management**: Display appropriate loading messages during data loading that automatically disappear once CoinGecko data loads successfully or falls back to cached data, with clear error messages when both fail
- **Distinct Live Data Display**: Dashboard symbols (BTC, ETH, XRP, SOL) display distinct CoinGecko live data with proper symbol-to-ID mapping verification

### Comprehensive Backend Tester Panel for System Diagnostics
- **Terminal-Style Interface**: Create a `SimulatedBashPanel.tsx` component that renders a terminal-style interface with dark background and monospace font
- **Dashboard Integration**: Mount the panel on the Dashboard page under a visible ⚙ "Backend Tester" button that allows users to open and close the panel
- **User Authentication Check**: Panel is accessible only for logged-in users with proper authentication validation
- **Organized Command Categories**: Group commands into logical categories with clear section headers:
  - **Connectivity Commands**: Test API connections and basic functionality
  - **Diagnostics Commands**: Verify system state and data integrity
  - **Admin Commands**: Administrative functions with proper access control
- **Connectivity Test Commands**: Add connectivity testing command buttons:
  - "CoinGecko Connection" button that calls `debugTestCoinGecko()` and displays success or error response from CoinGecko ping endpoint
  - "Load Symbols" button that calls `loadValidCryptoSymbols()` then displays the response from `getValidSymbols()` showing symbol count and example entries
  - "Raw Ticker Response" button that calls `debugFetchRawTicker()` and displays the raw JSON response from CoinGecko's price endpoint
- **Diagnostics Test Commands**: Add diagnostic command buttons:
  - "Symbol Count" button that calls `debugSymbolCount()` and displays the total number of symbols in validSymbols
  - "Valid Symbols Array" button that calls `debugValidSymbols()` and displays the complete array of symbol mappings to verify proper CoinGecko ID mapping
  - "Check BTC Symbol" button that calls `debugCheckSymbol("BTC")` and displays whether the symbol exists in validSymbols
  - "Parse Price (BTC)" button that calls `debugParseTicker("BTC")` and displays response length and first 500 characters
- **Live Market Data Test Commands**: Add market data testing command buttons:
  - "Get BTC Price" button that calls `getLiveMarketData("BTC")` and displays price, change24h, marketCap
  - "Get ETH Price" button that calls `getLiveMarketData("ETH")` and displays price, change24h, marketCap
  - "Get SOL Price" button that calls `getLiveMarketData("SOL")` and displays price, change24h, marketCap
- **Admin-Only Commands**: Add administrative command buttons with proper access control:
  - "Manual Fetch Symbols (Admin Only)" button that calls `loadValidCryptoSymbols()` command with admin-only access and displays the result
  - "Get Admin List" button that calls `debugGetAdminList()` and displays current admin principals for authorization troubleshooting
  - "Log Reset Actions" button that calls `debugResetSystem()` and displays intended reset actions without executing them
- **Status Display**: Show each call's execution status (Running, Success, Error) with appropriate visual indicators
- **Terminal Output Styling**: Display JSON results in terminal-like styled output with:
  - Monospace font for all output text
  - Dark background for the terminal area
  - Green text for successful responses
  - Red text for error messages
  - Clear formatting for JSON data in scrolling view
- **Backend Integration**: Ensure all calls are made through existing React Query hooks or direct actor methods for accurate backend testing
- **Collapsible Interface**: Panel can be toggled open/closed to avoid cluttering the main dashboard interface
- **Raw JSON Output Display**: Show raw JSON responses from backend calls in properly formatted, scrollable terminal output
- **Command Execution Feedback**: Provide clear visual feedback for command execution with loading states and completion indicators

### Landing Page Content
- Feature card for "Trend Forecasting" displays the description: "Visualize future price predictions using real historical market and project data to forecast trends accurately."
- Ensure this updated description appears consistently across all UI elements where trend forecasting functionality is described
- Replace any outdated text that references manual data entry with the accurate description of automated historical data usage

### Footer Disclaimer
- Display a humorous disclaimer text at the bottom of the application footer that reads: "For entertainment only — we're not responsible if you bet the farm on crypto. It's wild out there — invest smart!"
- Style the disclaimer text subtly with smaller font size and muted text color to maintain balance with other footer content
- Ensure the disclaimer is clearly visible but not dominate the footer design

### Frontend Configuration and Deployment
- **Automatic Runtime Canister ID Detection**: Implement intelligent runtime detection system that automatically discovers and injects the correct backend canister ID in the frontend configuration logic
- **Production and Mobile Environment Support**: Ensure canister ID detection works seamlessly across both production Internet Computer environments and mobile browser environments
- **Startup Validation and Retry Logic**: Add comprehensive startup validation with exponential backoff retry logic to confirm the backend canister resolves and is accessible before rendering the main UI
- **Friendly Connection Loading State**: Display user-friendly "Connecting to backend..." loading message with visual indicator until canister ID resolution and actor creation complete successfully
- **Cross-Environment Compatibility**: Automatic canister ID discovery that works reliably across local development, Internet Computer production, and mobile environments
- **Enhanced Connection Bootstrapper**: Implement a robust connection bootstrapper that prevents app rendering until backend canister ID is successfully discovered, validated, and actor connection is established
- **Exponential Backoff Retry Logic**: Implement multiple retry attempts with exponential backoff delays (starting at 1 second, doubling each attempt up to maximum 30 seconds) for canister ID resolution
- **Cross-Browser Compatibility**: Ensure reliable initialization across desktop and mobile browsers including Safari, Chrome, Firefox, and Edge
- **Loading State Management**: Display "Connecting to backend..." message with loading indicator during connection establishment process
- **Configuration Validation**: Validate backend canister connection before initializing actor and query hooks
- **Graceful Error Handling**: Handle connection failures with user-friendly error messages and retry options
- **Multi-Environment Support**: Automatic canister ID discovery that works across local development and Internet Computer production environments
- **Actor Initialization Control**: Ensure actor and query hooks load only after successful configuration validation and connection establishment
- **Connection State Persistence**: Maintain stable connection state once established to prevent re-initialization loops
- **Mobile-Optimized Loading**: Ensure loading states and connection messages are properly displayed on mobile devices with appropriate touch-friendly interfaces
- **Persistent Canister ID Storage**: Store the valid backend canister ID after first successful detection to avoid subsequent 400 errors on page reload
- **Connection Confirmation Check**: Implement thorough connection confirmation check that verifies backend accessibility before allowing main UI rendering
- **Reliable Backend Reachability**: Ensure backend canister is confirmed reachable and responsive before proceeding with application initialization

### Frontend Function Name Consistency
- **Complete Function Name Migration**: Replace all instances of deprecated `fetchBioFinTickerData(symbol)` function calls with `getLiveMarketData(symbol)` throughout the frontend codebase
- **Hook Updates**: Update all frontend hooks in `frontend/src/hooks/useQueries.ts` to use `getLiveMarketData` instead of `fetchBioFinTickerData`
- **Component Updates**: Ensure all components including `CryptoCard`, `Dashboard`, and the simulated Bash tester consistently call `getLiveMarketData(symbol)`
- **Import Statement Cleanup**: Remove all references to `BioFin` in imports, function names, and display text, replacing with "CoinGecko API" references
- **Consistent API References**: Update all display text and status messages to reference "CoinGecko API" instead of any legacy "BioFin" references
- **Function Call Verification**: Verify that all market data retrieval operations use the standardized `getLiveMarketData` function name consistently across the application

### Automatic Admin Authorization System
- **Automatic First User Admin Assignment**: Backend automatically detects the first logged-in Internet Identity principal during login or profile check and assigns admin privileges without user interaction
- **Silent Admin Role Assignment**: Admin role assignment occurs transparently during profile creation or login process without requiring separate authorization steps
- **Persistent Admin Privileges**: Admin privileges persist in the authorization map and apply to all `#admin` role checks using the existing `AccessControl` and `MixinAuthorization` mechanisms
- **Regular User Permissions**: All subsequent users maintain regular `#user` permissions and cannot access admin-restricted debug methods
- **Admin-Only Debug Access**: Debug functions including `debugCheckSymbol`, `debugFetchRawTicker`, `debugParseTicker`, `debugSymbolCount`, `debugTestCoinGecko`, `debugValidSymbols`, `debugGetAdminList`, and `debugResetSystem` are restricted to admin users only
- **Authorization Validation**: Backend validates admin privileges before allowing access to admin-restricted functionality with proper error messages for unauthorized access attempts
- **Persistent Admin Role Storage**: Admin role persists in the access control state and remains active after canister redeployment
- **Seamless Integration**: The admin role assignment integrates seamlessly with the automatic profile creation process without causing authorization errors

## Data Storage Requirements

### Backend Data Persistence
- **Automatic Profile Creation Storage**: Backend automatically creates and stores user profiles during login or profile check without user interaction
- **Silent Profile Persistence**: Store user profiles with automatic creation during Internet Identity principal detection with proper error handling and validation
- **Admin Role Storage**: Store the first logged-in Internet Identity principal as admin in persistent authorization map during automatic profile creation
- Store user watchlists with cryptocurrency identifiers
- **Reliable Watchlist Updates**: Backend properly handles `addCryptoToWatchlist` method calls and immediately persists new symbols to user watchlists
- **Enhanced CoinGecko Instruments Data Storage**: Store the complete parsed and filtered instruments data exclusively from CoinGecko `/coins/list` API with comprehensive JSON decoding using `mo:serde`, startup caching, and persistent storage across canister restarts
- **Persistent Dynamic Symbol Storage**: Store and maintain the complete `validSymbols` map populated exclusively with all active cryptocurrency symbols from CoinGecko instruments endpoint with persistent caching across sessions
- **Enhanced Anti-Loop Persistent Symbol Map**: Maintain persistent `validSymbols` map with all active crypto symbols from CoinGecko instruments endpoint, updated during canister initialization with intelligent caching that prevents infinite retry loops and maintains data across restarts
- **Stable Variable Symbol Initialization Tracking**: Store stable variable `symbolsInitialized : Bool = false` to track initialization state across canister upgrades and prevent duplicate symbol loading
- **Smart Caching Strategy**: Cache the complete instruments list with intelligent retry logic, persistent storage across canister restarts, and fallback to previously cached data for reliability while preventing infinite loops
- **Real API Data Caching**: Cache normalized actual market data from CoinGecko price API via HTTP outcalls with persistent storage to reduce redundant calls and prevent rate limiting
- **Enhanced Price Data Caching**: Cache parsed price data from the `getLiveMarketData` function using `mo:serde` with intelligent expiration and refresh logic
- **Historical Data Storage**: Store actual historical price trends and market metrics fetched from CoinGecko API via HTTP outcalls with persistent caching
- **API Configuration State**: Store CoinGecko API configuration status, connection health, and error states for proper error reporting and recovery
- **Parsed JSON Data Caching**: Cache parsed JSON responses from all CoinGecko endpoints (instruments list, price data, historical data) using `mo:serde` with intelligent expiration, refresh logic, and persistent storage
- **Enhanced Fallback Data Storage**: Maintain cached data with persistent storage for temporary outages with clear status indicators, automatic refresh when API becomes available, and graceful degradation
- **Comprehensive Backend Data Maps**: Implement complete backend caching system with dedicated persistent maps for symbols, live market data, and historical price data from CoinGecko API
- **Sanitized Symbol Storage**: Store only validated and sanitized symbols with persistent caching, filtering out invalid or inactive symbols from CoinGecko API responses
- Save user-specific data associations
- Store user preferences for forecasting methods per cryptocurrency symbol
- Persist alert threshold settings per cryptocurrency in user profiles
- **Automatic Admin Authorization Storage**: Store admin user principals in persistent authorization map with automatic assignment during profile creation
- **Seamless Admin Persistence**: Store the first logged-in Internet Identity principal as admin automatically during profile creation with persistent role storage

### Frontend State Management
- **Automatic Profile State Management**: Frontend automatically handles profile existence and creation without showing ProfileSetupModal, proceeding directly to dashboard after login
- **Silent Login Flow State**: Manage login flow state to automatically check profile existence and skip manual profile setup steps
- **Enhanced Symbol Dropdown Management**: Properly manage complete symbol dropdown state populated with cached CoinGecko instruments data with startup fetching, interactive selection, and error handling
- **Manual Entry State**: Handle manual symbol entry state alongside dropdown functionality with immediate validation against cached CoinGecko instruments data, even during loading, with proper error handling and retry options
- **Enhanced Loading State Management**: Frontend validation dialog shows appropriate loading messages during instruments data fetching, which automatically disappear once data loads successfully, falls back to cached data, or displays clear error messages
- **Enhanced live data handling**: Manage real-time market data fetched from backend's actual CoinGecko price HTTP outcall integration with proper loading, error states, and cached data fallback
- **Live API Chart Rendering**: Handle chart rendering and statistical calculations based on actual CoinGecko API-sourced historical data via HTTP outcalls with cached data support
- Store temporary analysis results and visualizations
- Manage real-time notifications and alert states
- **Enhanced API Status State Management**: Manage and display "CoinGecko API configured and connected" status when CoinGecko API is properly configured and responding with real data, with error reporting and health monitoring
- Handle error states gracefully with user-friendly error messages, clear UI feedback for failed API calls, and retry mechanisms
- Manage partial data scenarios when CoinGecko API provides incomplete information with cached fallback
- **Frontend live data hooks**: Update frontend data hooks to process real-time and historical JSON responses from actual CoinGecko HTTP outcalls for accurate forecasting and visualization with comprehensive error handling
- **Connection Bootstrapper State**: Track backend canister discovery and connection validation status with clear user feedback and retry mechanisms
- **Initialization Sequence Control**: Manage app initialization sequence with exponential backoff retry logic to prevent content rendering until backend connection is established
- **Cross-Browser State Handling**: Handle connection state management consistently across different desktop and mobile browsers
- **Actor Loading State**: Control actor and query hook initialization to occur only after successful configuration validation
- **Canister ID Resolution State**: Track canister ID detection progress and resolution status with appropriate loading indicators and error handling
- **Real-Time Data Synchronization**: Dynamically reflect updated symbol lists and live market data in real time from complete CoinGecko instruments integration with error handling and cached fallback
- **Enhanced Fallback State Management**: Handle temporary API outages with cached data display, clear status indicators, and automatic retry mechanisms
- **Live Data Accuracy Display**: Frontend displays accurate price, market cap, and historical trend information from backend's cached CoinGecko data for all watchlist and forecast features with error handling and fallback
- **Persistent Configuration State**: Maintain persistent storage of validated canister ID to prevent repeated detection attempts and 400 errors on reload
- **Enhanced Dynamic Dropdown State Management**: Manage AddCryptoDialog dropdown state to populate dynamically with the complete list of valid symbols from backend's cached CoinGecko data with error handling and loading states
- **Symbol Loading State**: Handle loading states for instruments list fetching and display appropriate feedback while CoinGecko data is being retrieved and parsed, with error handling and cached fallback
- **Complete Symbol List Reception**: Frontend receives and displays the complete live cryptocurrency list with accurate symbol names from backend's complete CoinGecko integration with error handling and cached support
- **Integration Status Management**: Remove all "Backend Integration Pending" status messages and replace with actual integration status once CoinGecko data is successfully loaded, with proper error reporting for integration failures
- **Universal Symbol Validation State**: Frontend handles validation for all valid cryptocurrency symbols including TAO without showing "validation failed" errors, using cached data when fresh validation is unavailable
- **Backend Tester Panel State**: Manage the open/closed state of the SimulatedBashPanel component and handle the execution status of backend testing commands with proper authentication checks
- **Debug Command State Management**: Handle execution status and results display for all debug commands including the comprehensive debug functions and backend tester commands with proper loading indicators and error handling
- **Command Category State Management**: Handle execution status and results display for the organized command categories (Connectivity, Diagnostics, Admin) with proper loading indicators, error handling, and terminal-style output formatting
- **Function Name Consistency State**: Ensure all frontend state management consistently uses `getLiveMarketData` function calls instead of deprecated `fetchBioFinTickerData` references

## Technical Requirements
- **Enhanced HTTP Outcalls Implementation**: Backend implements fully functional HTTP outcalls using working GET requests with IC `http_request` capability properly declared in canister configuration, registered with Internet Computer management canister, and comprehensive error handling with retry logic
- **Robust CoinGecko Endpoints HTTP Integration**: Backend performs proper HTTP outcalls to CoinGecko's `/coins/list` and simple/price endpoints during application startup and runtime with comprehensive JSON response parsing using `mo:serde`, error handling, and graceful fallback mechanisms
- **Enhanced mo:serde Package Integration**: Backend integrates `mo:serde` package for robust JSON parsing:
  - Add `mo:serde` package to backend using `mops add serde` command
  - Import `mo:serde/JSON`, `mo:base/Debug`, and `mo:base/Float` into `backend/main.mo`
  - Implement complete `parseCoingeckoResponse` function using `mo:serde` to correctly parse CoinGecko API JSON responses from `/simple/price` endpoint
  - Parse `usd`, `usd_24h_change`, and `usd_market_cap` fields from CoinGecko price endpoint responses with proper error handling
  - Integrate enhanced `parseCoingeckoResponse` into `getLiveMarketData()` logic for real live data parsing
  - Add debug logging with `Debug.print` for raw response and parsing results for troubleshooting
  - Ensure `dfx.json` includes `"packtool": "mops sources"` under the `defaults.build` section for proper compilation
- **Enhanced buildCoinGeckoUrl Function Implementation with Debug Logging**: Backend implements `buildCoinGeckoUrl` function that constructs proper CoinGecko API URLs with all required parameters: `ids`, `vs_currencies=usd`, `include_market_cap=true`, and `include_24hr_change=true`, with detailed debug prints to verify symbol-to-ID mapping, printing both the symbol and CoinGecko ID used in each request
- **Debug-Enhanced fetchCoinGeckoData Function Implementation**: Backend replaces existing `fetchCoinGeckoData` function with debug-enhanced version that includes comprehensive logging:
  - Logs when called with `🔍 fetchCoinGeckoData called for:` followed by the symbol
  - Logs the full built URL with `📡 Built URL:` followed by the complete CoinGecko API URL
  - Logs the returned raw response with `📥 Got response:` followed by the raw API response text
  - Integrates seamlessly with existing `buildCoinGeckoUrl` and `parseCoingeckoResponse` functions
  - Maintains all existing error handling and retry logic while adding detailed debug output
  - Confirms correct symbol mapping and unique data per coin through comprehensive logging
  - Ensures backend redeployment outputs detailed logs confirming correct symbol mapping and unique data per coin
- **Enhanced System Initialization Timer with Debug Logging**: Backend implements system initialization function that automatically triggers symbol fetching from CoinGecko API using a 2-second timer delay immediately when the canister starts, with detailed debug logging including:
  - Print "=== CANISTER INIT STARTED ===" at the start of the init function
  - Print "=== TIMER TRIGGERED - FETCHING COINGECKO ===" when the timer callback executes
  - Print "=== COINGECKO FETCH COMPLETED ===" after successful completion of `fetchAndLoadSymbolsFromAPI`
  - Print "!!! INIT ERROR: " followed by the error message in the catch block for debugging purposes
  - Ensure symbols are cached and available from the first user interaction with comprehensive error logging
- **Post-Upgrade Symbol Loading Implementation**: Backend implements `system func postupgrade()` that checks if stable variable `symbolsInitialized` is false, runs `loadSymbolsInternal()`, and then sets `symbolsInitialized := true` to ensure symbols are loaded after canister upgrades
- **Internal Symbol Loading Function Implementation**: Backend implements `loadSymbolsInternal()` to populate validSymbols with correct CoinGecko mappings for BTC → bitcoin, ETH → ethereum, USDT → tether, USDC → usd-coin, XRP → ripple, DOGE → dogecoin, ADA → cardano, SOL → solana, MATIC → polygon
- **Automatic Profile Creation Implementation**: Backend automatically detects logged-in Internet Identity principal during login or profile check and creates user profile silently without modal interaction
- **Automatic Admin Assignment Implementation**: Backend automatically assigns the first logged-in Internet Identity principal as admin during profile creation and persists the role across sessions
- **Enhanced CoinGecko JSON Parsing Implementation with mo:serde**: Backend implements complete and robust JSON parsing for all CoinGecko responses using `mo:serde` with comprehensive error handling to extract and populate data with:
  - Complete JSON response structure parsing for coins/list endpoint with error recovery
  - Individual symbol object extraction from instruments data with validation
  - Live price data extraction from simple/price endpoint responses using enhanced `parseCoingeckoResponse` function with error handling
  - Symbol status and activity validation with error handling
  - Complete mapping of all active cryptocurrency symbols and trading pairs with graceful error recovery
- **Enhanced Anti-Loop Symbol Map Population**: Populate `validSymbols` map with all active cryptocurrency symbols from parsed CoinGecko instruments data during canister initialization with intelligent caching, persistent storage, and comprehensive error handling that prevents infinite retry loops
- **Symbol Filtering and Validation**: Filter CoinGecko coins/list response to include only valid cryptocurrency symbols using comprehensive filtering logic with error handling and validation
- **Enhanced Smart Canister State Symbol Caching**: Cache the complete filtered instruments list in canister state during initialization with intelligent caching strategy, persistent storage across restarts, and comprehensive error handling that prevents infinite retry loops while maintaining data freshness
- **Complete Live Market Data Integration with mo:serde**: Backend implements complete JSON parsing for CoinGecko price data responses using `mo:serde` and enhanced `parseCoingeckoResponse` function with proper field extraction and comprehensive error handling with graceful fallback
- **Symbol-to-Endpoint Verification**: Verify that price endpoints work seamlessly with all symbols from CoinGecko integration with proper error handling and fallback mechanisms
- **Enhanced JSON Parsing with Comprehensive Error Handling**: Backend implements robust JSON parsing using `mo:serde` with comprehensive error handling, logging for all parsing failures, API timeouts, malformed responses, and graceful fallback to cached data
- **Static Fallback Elimination**: Remove static fallback completely and replace with dynamically fetched instruments lists exclusively from CoinGecko API with persistent cached fallback for reliability
- **Complete CoinGecko API Configuration**: Backend fully configured to support secure HTTPS connections exclusively to CoinGecko API with proper SSL/TLS certificate validation, working response transformation, and comprehensive error handling
- **Operational API Function Implementation**: Backend functions use real HTTP requests and return live JSON-parsed data from CoinGecko using `mo:serde` with comprehensive error handling and cached fallback instead of any placeholder responses
- **Production-Ready OutCall Module Configuration**: HTTP outcall module properly configured with working transformation functions, cycles configuration, management canister integration, and comprehensive error handling for secure and reliable external API calls exclusively to CoinGecko
- **Verified Main Actor Integration**: Main actor uses real CoinGecko API URLs with working HTTP outcall integration for live data retrieval with comprehensive error handling and retry logic
- **Enhanced Rate Limit Management**: Implement comprehensive rate limit handling, intelligent retry logic with exponential backoff, and graceful degradation for CoinGecko API
- **Proper Transformation Registration**: Ensure all HTTP outcall transformations are correctly registered on the canister to support live outcalls in production environment with proper error handling
- **Comprehensive Error Handling with Enhanced UI Feedback**: Robust error handling and validation to gracefully handle connection issues, API rate-limits, timeout scenarios, and JSON parsing errors with clear UI feedback, user-friendly error messages, and retry mechanisms
- **Validated HTTP Outcall Registration**: All required HTTP outcall configurations including transform functions, cycles management, and response handling are properly registered, validated for Internet Computer deployment, and include comprehensive error recovery
- **Complete Mock Data Elimination**: Replace all placeholder data, "N/A" values, "Historical Data Unavailable" messages, "Backend Integration Pending" notices, and mock responses with real CoinGecko API responses parsed using `mo:serde` and cached fallback data
- **Universal Symbol Validation Enhancement**: Backend validates manually typed symbols against the complete cached CoinGecko instruments data to ensure all valid tradable symbols including TAO are accepted, using cached data when fresh validation is unavailable
- **Enhanced Startup Instruments List Initialization**: Backend fetches and caches the complete instruments list exclusively from CoinGecko `/coins/list` endpoint during canister startup with persistent storage, comprehensive error handling, and graceful fallback to cached data
- **Immediate Manual Entry Support**: Backend implements validation logic that allows immediate manual symbol entry validation using cached data even when CoinGecko's instruments list is still loading or temporarily unavailable
- **Live Symbol Synchronization**: Frontend receives and displays the complete live cryptocurrency list with accurate symbol names from backend's dynamic CoinGecko integration with error handling and cached support
- **Complete CoinGecko Integration Finalization**: Complete the CoinGecko endpoint integration with comprehensive error handling to resolve all "Backend Integration Pending" status messages and enable full instruments list population with graceful fallback
- **Frontend Symbol List Integration**: Update frontend to receive and display the complete dynamic symbol list from backend's CoinGecko integration with error handling and cached fallback, replacing any limited cached symbols
- **Verified Live API Integration**: Ensure CoinGecko price API returns actual live price, change, market cap values for all cryptocurrencies via HTTP outcalls using `mo:serde` parsing with comprehensive error handling and cached fallback
- **Enhanced Dynamic Symbol Integration**: Implement comprehensive symbol fetching exclusively from CoinGecko `/coins/list` API using HTTP outcalls with intelligent caching, persistent storage, anti-loop protection, and comprehensive error handling
- **Performance-Optimized Caching**: Implement advanced caching system for actual market data with timestamp-based invalidation, persistent storage across restarts, and comprehensive error handling to prevent API rate limit violations
- **Enhanced Backend Anti-Loop Implementation**: Implement intelligent caching mechanisms with persistent storage for all HTTP outcall operations to prevent infinite retry loops with comprehensive error handling
- **Partial Response Handling**: Backend handles and returns partial symbol lists when CoinGecko API timeouts or fails after retry attempts, with fallback to cached data when available
- **Robust Error Handling with Recovery**: Backend provides comprehensive error handling, reporting for API configuration issues, graceful degradation, and automatic recovery mechanisms with clear UI feedback
- **Data normalization layer**: Ensure consistent format from CoinGecko API HTTP outcall responses with comprehensive error handling and validation
- **Enhanced frontend integration**: Frontend calls backend's actual HTTP outcall integration and properly displays live market data results from CoinGecko with error handling and cached fallback
- **Dynamic Dropdown Integration**: Frontend AddCryptoDialog properly integrates complete symbol dropdown with backend dynamic symbol fetching via HTTP outcalls with error handling and loading states
- **Live Data Statistical Analysis**: Implement multiple statistical analysis algorithms using actual CoinGecko historical data from HTTP outcalls with error handling and cached fallback
- Create responsive, interactive charts for data visualization with real-time method switching using live CoinGecko API data and cached fallback
- Ensure clean, modern UI design with consistent application branding and balanced color scheme
- Implement real-time alert monitoring and notification system
- **Comprehensive Error Handling with Enhanced UI Feedback**: Robust error handling for all HTTP outcall operations with clear user feedback, graceful degradation, user-friendly error messages for failed API calls, and retry mechanisms
- **API Configuration Monitoring**: Monitor and report CoinGecko API configuration health, connection status, and error states with automatic recovery
- **Performance optimization**: Intelligent caching of actual CoinGecko data from HTTP outcalls with persistent storage across restarts
- **Robust Connection Bootstrapper Implementation**: Build comprehensive connection bootstrapper with exponential backoff retry logic that works reliably across all browser environments
- **Cross-Platform Initialization**: Ensure consistent initialization behavior across desktop and mobile browsers with proper touch and interaction support
- **Enhanced Configuration Discovery**: Implement advanced canister ID discovery with multiple fallback mechanisms and environment detection
- **Connection Validation System**: Build thorough connection validation that prevents app initialization until backend communication is verified
- **Browser Compatibility Layer**: Ensure initialization logic works consistently across Safari, Chrome, Firefox, and Edge browsers on both desktop and mobile platforms
- **End-to-End Testing and Verification**: Complete testing of CoinGecko API to confirm successful responses and verify data flow from CoinGecko API through backend HTTP outcalls to frontend display with comprehensive error handling
- **Silent Profile Creation Implementation**: Backend provides automatic profile creation during login or profile check without requiring ProfileSetupModal interaction
- **LiveMarketResponse Structure**: Backend returns properly structured `LiveMarketResponse` objects with parsed JSON data from CoinGecko price API using `mo:serde` and comprehensive error handling
- **Correct URL and Transformation Configuration**: All CoinGecko API URLs and HTTP outcall transformations are properly connected using working HTTP requests with correct IC configuration and comprehensive error handling
- **Automatic Canister ID Runtime Detection**: Implement intelligent runtime system that automatically detects and injects the correct backend canister ID during frontend initialization
- **Multi-Environment Canister Resolution**: Build canister ID resolution system that works seamlessly across production Internet Computer environments and mobile browser environments
- **Startup Connection Validation**: Implement comprehensive startup validation that confirms backend canister accessibility and actor creation before allowing main UI rendering
- **Production and Mobile Environment Compatibility**: Ensure all canister ID detection and connection logic works reliably on both production deployments and mobile browser environments
- **Complete CoinGecko-Only Backend Integration**: Complete backend integration exclusively with CoinGecko `/coins/list` and simple/price API endpoints with comprehensive JSON parsing using `mo:serde`, error handling, and graceful fallback for all endpoints
- **Frontend Real-Time Synchronization**: Frontend dynamically reflects updated symbol lists and live data in real time with error handling and cached fallback, removing all references to static lists or inactive JSON mocks
- **Intelligent Fallback Logic**: Implement caching and fallback mechanisms with persistent storage for rate limits and temporary CoinGecko outages with clear status indicators and automatic recovery
- **Symbol Validation and Filtering**: Backend implements comprehensive validation and sanitization of symbols from CoinGecko API with error handling, filtering out invalid or inactive symbols to ensure only tradable cryptocurrency assets are available
- **Complete Backend Data Caching System**: Backend implements comprehensive caching system with persistent storage and dedicated maps for all parsed CoinGecko data including symbols, live market data, and historical price data with intelligent cache management, expiration, and error recovery
- **Watchlist and Forecast Live Data Integration**: Ensure all watchlist and forecast features display accurate live price, market cap, and historical trend information fetched directly from backend's cached CoinGecko endpoint data with error handling and cached fallback
- **Backend Response Success Validation**: Implement comprehensive backend-side validation to confirm successful CoinGecko API responses, proper JSON parsing using `mo:serde`, data completeness, and error recovery before returning data to frontend
- **Pre-Frontend Load Verification**: Backend performs thorough data verification checks during startup and before each response to ensure all critical CoinGecko endpoints are accessible and returning valid, complete data with error handling and cached fallback
- **Response Integrity Checks**: Backend validates HTTP response status codes, JSON structure integrity, required field presence, data format correctness, and implements error recovery before caching and serving data to frontend
- **Startup Data Validation**: Backend implements comprehensive startup validation sequence that confirms all CoinGecko endpoints are responding correctly with valid data, with error handling and cached fallback before allowing frontend initialization
- **Enhanced Canister ID Persistence**: Implement local storage mechanism to persist validated canister ID after first successful detection, preventing repeated detection attempts and avoiding 400 errors on page reload
- **Connection Retry with Enhanced Exponential Backoff**: Implement comprehensive connection retry logic with exponential backoff delays starting at 1 second and doubling each attempt up to maximum 30 seconds for canister ID resolution and backend connectivity with error recovery
- **Backend Reachability Confirmation**: Implement thorough backend reachability confirmation check that verifies canister accessibility and responsiveness before proceeding with main application initialization
- **CoinGecko Symbol Format Mapping**: Implement mapping layer to convert CoinGecko's symbol format into ItsRon's existing `SymbolInfo` structure for seamless frontend integration with error handling
- **Frontend Hook Updates**: Update all frontend hooks in `useQueries.ts` and related files to work with CoinGecko data structure and API responses with comprehensive error handling and cached fallback
- **Universal Symbol Acceptance Logic**: Backend validation logic accepts all user-entered valid symbols including TAO immediately after instruments caching completes or during loading with immediate validation support using cached data when available
- **Enhanced Loading State Elimination**: Ensure loading messages automatically disappear once CoinGecko data loads successfully, falls back to cached data, or displays clear error messages with proper state management
- **Backend Testing Component Implementation**: Create `SimulatedBashPanel.tsx` component with terminal-style interface that integrates with existing React Query hooks and actor methods for direct backend testing with user authentication validation
- **Terminal Styling Implementation**: Implement monospace font, dark background, and colored text (green for success, red for errors) for authentic terminal appearance with scrollable output view
- **Command Execution Integration**: Ensure backend testing commands properly integrate with existing frontend data fetching mechanisms and display real backend responses with execution status indicators
- **Comprehensive Debug Function Implementation**: Implement all debug functions in `backend/main.mo` positioned after existing CoinGecko integration code using `OutCall.httpGetRequest`, `transform`, `Error.message`, and `Text.slice/Nat.toText` for accurate debugging output:
  - `debugCheckSymbol(symbol : Text)` to verify symbol existence in `validSymbols`
  - `debugFetchRawTicker()` to execute direct HTTP GET to price endpoint and return raw response or error
  - `debugParseTicker(symbol : Text)` to fetch price endpoint, show response length, and return first 500 characters
  - `debugSymbolCount()` to return total count of entries in `validSymbols` map
  - `debugTestCoinGecko()` to perform HTTP GET to `https://api.coingecko.com/api/v3/ping` and return success or error response
  - `debugValidSymbols()` public query function that returns `validSymbols.toArray()` to enable verification of symbol-to-CoinGecko ID mappings
  - `debugGetAdminList()` to return current admin principals for authorization troubleshooting
  - `debugResetSystem()` to log intended reset actions without executing them for system state verification
- **Enhanced Debug Command Integration**: Integrate all debug functions with the SimulatedBashPanel component through proper React Query hooks or direct actor method calls with execution status tracking and terminal-style output display
- **Organized Command Category Integration**: Integrate the organized command categories (Connectivity, Diagnostics, Admin) in the SimulatedBashPanel component with proper grouping, section headers, and access control for admin-only commands
- **Frontend Function Name Migration**: Replace all instances of deprecated `fetchBioFinTickerData(symbol)` function calls with `getLiveMarketData(symbol)` throughout the frontend codebase including:
  - Update all function calls in `frontend/src/hooks/useQueries.ts`
  - Update all component references in `CryptoCard`, `Dashboard`, and simulated Bash tester
  - Remove all `BioFin` references in imports, function names, and display text
  - Replace with consistent "CoinGecko API" references throughout the application
  - Ensure all market data retrieval operations use the standardized `getLiveMarketData` function name
- **Automatic Admin Authorization Implementation**: Implement role-based access control system using existing `AccessControl` and `MixinAuthorization` mechanisms with automatic admin registration for the first logged-in Internet Identity principal during profile creation or login initialization
- **Admin Role Validation**: Backend validates admin privileges before allowing access to admin-restricted debug functions with proper error messages for unauthorized access attempts
- **Silent Admin Storage**: Store the first logged-in Internet Identity principal as admin in persistent authorization map automatically during profile creation with proper role-based access control that persists across canister restarts
- **Automatic Admin Registration**: Backend automatically grants admin privileges to the first logged-in Internet Identity principal during profile creation and persists this role across redeployments
- **Seamless Admin Role Assignment**: Ensure that admin role assignment occurs automatically during the profile creation process without requiring separate authorization steps or causing authorization errors
- Application language: English
