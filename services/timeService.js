const extractCoinSymbolAndTime = (text) => {
  let upper = text.toUpperCase().trim();

  // Bỏ hậu tố USDT nếu có (VD: NKNUSDT => NKN)
  if (upper.endsWith("USDT")) {
    upper = upper.slice(0, -4);
  }

  // Trường hợp chỉ là symbol (vd: BTC)
  if (/^[A-Z0-9]{1,10}$/.test(upper)) {
    return { symbol: upper, time: null };
  }

  // Trường hợp là symbol kèm số giờ (vd: BTC 7, ETH 12h)
  const matches = upper.match(/^([A-Z0-9]{1,10})\s*(\d{1,2})h?$/);
  if (!matches) return { symbol: null, time: null };

  let symbol = matches[1];
  const time = parseInt(matches[2], 10);

  // Bỏ USDT nếu người dùng nhập symbol kèm theo thời gian (VD: NKNUSDT 7 => NKN 7)
  if (symbol.endsWith("USDT")) {
    symbol = symbol.slice(0, -4);
  }

  if (time < 0 || time > 23) {
    return { symbol, time: 'invalid' };
  }

  return { symbol, time };
};

module.exports = { extractCoinSymbolAndTime };
