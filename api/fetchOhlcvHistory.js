// api/fetchOpenInterest.js
const { COINALYZE_API_KEY } = require('../config');  // Đảm bảo đường dẫn đúng, nếu 'config.js' nằm trong thư mục gốc

async function fetchOhlcvHistory(symbol, from, to) {
    const coinalyzeSymbol = `${symbol}USDT_PERP.A`;
    const url = `https://api.coinalyze.net/v1/ohlcv-history?symbols=${coinalyzeSymbol}&interval=1hour&from=${from}&to=${to}&api_key=${COINALYZE_API_KEY}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data || data.length === 0) {
        return { success: false, error: `❌ Không tìm thấy OHLCV coin có tên "${symbol}".` };
      }
  
      if (!data[0].history || data[0].history.length === 0) {
        return { success: false, error: `❌ Không có dữ liệu OHLCV trong thời gian này.` };
      }
  
      const ohlcv = data[0].history[0];
  
      return {
        success: true,
        symbol,
        open: ohlcv.o,
        high: ohlcv.h,
        low: ohlcv.l,
        close: ohlcv.c,
        volume: ohlcv.v,
        baseVolume: ohlcv.bv,
        totalTx: ohlcv.tx,
        buyTx: ohlcv.btx,
        timestamp: new Date(ohlcv.t * 1000).toLocaleString(),
      };
    } catch (err) {
      console.error("Lỗi khi gọi API OHLCV History:", err);
      return { success: false, error: "❌ Lỗi khi gọi API OHLCV History." };
    }
  }

  module.exports = fetchOhlcvHistory;
