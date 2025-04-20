// api/fetchOpenInterest.js
const { COINALYZE_API_KEY } = require('../config');  // Đảm bảo đường dẫn đúng, nếu 'config.js' nằm trong thư mục gốc

async function fetchLongShortRatio(symbol, from, to) {
    const coinalyzeSymbol = `${symbol}USDT_PERP.A`;
    const url = `https://api.coinalyze.net/v1/long-short-ratio-history?symbols=${coinalyzeSymbol}&interval=1hour&from=${from}&to=${to}&api_key=${COINALYZE_API_KEY}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      // Trường hợp symbol không tồn tại
      if (!data || data.length === 0) {
        return { success: false, error: `❌ Không tìm thấy Long-Short Ratio coin có tên "${symbol}".` };
      }
  
      // Trường hợp có symbol nhưng không có dữ liệu tỷ lệ Long/Short
      if (!data[0].history || data[0].history.length === 0) {
        return { success: false, error: `❌ Không có dữ liệu tỷ lệ Long/Short trong thời gian này.` };
      }
  
      // Dữ liệu hợp lệ - trả về tất cả dữ liệu tỷ lệ Long/Short
      const historyData = data[0].history.map(item => ({
        timestamp: new Date(item.t * 1000).toLocaleString(),
        ratio: item.r,
        long: item.l,
        short: item.s,
      }));
  
      return {
        success: true,
        symbol,
        history: historyData,
      };
    } catch (err) {
      console.error("Lỗi khi gọi API Long-Short Ratio:", err);
      return { success: false, error: "❌ Lỗi khi gọi API Long-Short Ratio." };
    }
  }

  module.exports = fetchLongShortRatio;
