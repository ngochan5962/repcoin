const fetch = require("node-fetch");
const { COINALYZE_API_KEY } = require('../config');  // Kiểm tra đường dẫn tới file config.js


async function fetchFundingRate(symbol, from, to) {
  const coinalyzeSymbol = `${symbol}USDT_PERP.A`;
  const url = `https://api.coinalyze.net/v1/predicted-funding-rate-history?symbols=${coinalyzeSymbol}&interval=1hour&from=${from}&to=${to}&api_key=${COINALYZE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.length === 0) {
      return { success: false, error: `❌ Không tìm thấy coin có tên "${symbol}". Vui lòng kiểm tra lại.` };
    }

    if (data[0].history.length === 0) {
      return { success: false, error: "❌ Không tìm thấy dữ liệu funding rate cho khoảng thời gian này." };
    }

    const fundingData = data[0].history[0];
    return {
      success: true,
      symbol: symbol,
      open: fundingData.o,
      high: fundingData.h,
      low: fundingData.l,
      close: fundingData.c,
      timestamp: new Date(fundingData.t * 1000).toLocaleString(),
    };
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
    return { success: false, error: "❌ Lỗi khi gọi API." };
  }
}

module.exports = fetchFundingRate;
