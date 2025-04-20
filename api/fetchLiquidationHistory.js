// api/fetchOpenInterest.js
const { COINALYZE_API_KEY } = require('../config');  // Đảm bảo đường dẫn đúng, nếu 'config.js' nằm trong thư mục gốc

async function fetchLiquidationHistory(symbol, from, to) {
    const coinalyzeSymbol = `${symbol}USDT_PERP.A`;
    const url = `https://api.coinalyze.net/v1/liquidation-history?symbols=${coinalyzeSymbol}&interval=1hour&from=${from}&to=${to}&api_key=${COINALYZE_API_KEY}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      // Trường hợp symbol không tồn tại
      if (!data || data.length === 0) {
        return { success: false, error: `❌ Không tìm thấy Liquidation coin có tên "${symbol}".` };
      }
  
      // Trường hợp có symbol nhưng không có dữ liệu thanh lý
      if (!data[0].history || data[0].history.length === 0) {
        return { success: false, error: `❌ Không có dữ liệu thanh lý trong thời gian này.` };
      }
  
      // Dữ liệu hợp lệ - trả về tất cả dữ liệu lịch sử thanh lý
      return {
        success: true,
        symbol,
        history: data[0].history.map(item => ({
          timestamp: item.t, // 
          long: item.l,
          short: item.s,
        }))
      };
    } catch (err) {
      console.error("Lỗi khi gọi API Liquidation History:", err);
      return { success: false, error: "❌ Lỗi khi gọi API Liquidation History." };
    }
  }


  module.exports = fetchLiquidationHistory;
