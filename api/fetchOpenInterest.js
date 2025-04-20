// open interest history
// api/fetchOpenInterest.js
const { COINALYZE_API_KEY } = require('../config');  // Đảm bảo đường dẫn đúng, nếu 'config.js' nằm trong thư mục gốc

async function fetchOpenInterest(symbol, from, to) {
    const coinalyzeSymbol = `${symbol}USDT_PERP.A`;
    const url = `https://api.coinalyze.net/v1/open-interest-history?symbols=${coinalyzeSymbol}&interval=1hour&from=${from}&to=${to}&api_key=${COINALYZE_API_KEY}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      // Trường hợp symbol sai → API trả về mảng rỗng
      if (!data || data.length === 0) {
        return { success: false, error: `❌ Không tìm thấy coin có tên "${symbol}".` };
      }
  
      // Symbol đúng nhưng không có dữ liệu trong khoảng thời gian
      if (!data[0].history || data[0].history.length === 0) {
        return { success: false, error: `❌ Không có dữ liệu Open Interest trong thời gian này.` };
      }
  
      // Dữ liệu hợp lệ - trả về tất cả dữ liệu lịch sử Open Interest
      return {
        success: true,
        symbol,
        history: data[0].history.map(item => ({
          timestamp: new Date(item.t * 1000).toLocaleString(),
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
        }))
      };
    } catch (err) {
      console.error("Lỗi khi gọi API OI:", err);
      return { success: false, error: "❌ Lỗi khi gọi API Open Interest." };
    }
  }

  module.exports = fetchOpenInterest;
