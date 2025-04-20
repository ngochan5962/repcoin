const extractCoinSymbolAndTime = (text) => {
  const upper = text.toUpperCase().trim();
  const parts = upper.split(/\s+/); // Tách theo khoảng trắng

  let symbol = parts[0] || null;
  let time = parts[1] ? parseInt(parts[1], 10) : null;

  // Bỏ hậu tố USDT nếu có
  if (symbol && symbol.endsWith("USDT")) {
    symbol = symbol.slice(0, -4);
  }

  // Validate symbol
  if (!/^[A-Z0-9]{1,10}$/.test(symbol)) {
    return { symbol: null, time: null };
  }

  // Validate time
  if (time !== null && (isNaN(time) || time < 0 || time > 23)) {
    return { symbol, time: 'invalid' };
  }

  return { symbol, time };
};

module.exports = { extractCoinSymbolAndTime };
