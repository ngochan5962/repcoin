const extractCoinSymbolAndTime = (text) => {
    const upper = text.toUpperCase().trim();
    if (/^[A-Z0-9]{1,10}$/.test(upper)) {
      return { symbol: upper, time: null };
    }
  
    const matches = upper.match(/^([A-Z0-9]{1,10})\s*(\d{1,2})h?$/);
    const symbol = matches?.[1] || null;
    const time = matches?.[2] ? parseInt(matches[2]) : null;
  
    if (time !== null && (time < 0 || time > 23)) {
      return { symbol, time: 'invalid' };
    }
  
    return { symbol, time };
  };
  
  module.exports = { extractCoinSymbolAndTime };
  