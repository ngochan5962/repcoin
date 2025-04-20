


const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");

const BOT_TOKEN = "7640032809:AAGR2tINBy3rebm8kjMXPBWUSEz9D-C44MM";
const COINALYZE_API_KEY = "484f4af7-9a4f-48c5-b59e-c605b1288d4d";

const bot = new Telegraf(BOT_TOKEN);



// funding rate history
async function fetchFundingRate(symbol, from, to) {
  const coinalyzeSymbol = `${symbol}USDT_PERP.A`;
  const url = `https://api.coinalyze.net/v1/predicted-funding-rate-history?symbols=${coinalyzeSymbol}&interval=1hour&from=${from}&to=${to}&api_key=${COINALYZE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Trường hợp symbol không đúng → data = []
    if (!data || data.length === 0) {
      return { success: false, error: `❌ Không tìm thấy coin có tên "${symbol}". Vui lòng kiểm tra lại.` };
    }

    // Trường hợp không có dữ liệu trong symbol hợp lệ
    if (data[0].history.length === 0) {
      return { success: false, error: "❌ Không tìm thấy dữ liệu funding rate cho khoảng thời gian này." };
    }

    // Dữ liệu hợp lệ
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


// open interest history
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



// Liquidation History
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
        timestamp: new Date(item.t * 1000).toLocaleString(),
        long: item.l,
        short: item.s,
      }))
    };
  } catch (err) {
    console.error("Lỗi khi gọi API Liquidation History:", err);
    return { success: false, error: "❌ Lỗi khi gọi API Liquidation History." };
  }
}



// Long-Short Ratio History
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



// OHLCV History
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



// Gửi tin nhắn



async function sendFullMarketDataMessage(ctx, symbol, time) {
  let from, to;

  // Kiểm tra nếu người dùng nhập thời gian (time)
  if (time !== null) {
    // Nếu có thời gian (ví dụ: 7h)
    const inputHour = time;

    // Lấy ngày tháng năm hiện tại để làm căn cứ
    const now = new Date();
    let year = now.getFullYear();  // Lấy năm hiện tại
    let month = now.getMonth();    // Lấy tháng hiện tại (tính từ 0)
    let day = now.getDate();       // Lấy ngày hiện tại

    // Tạo đối tượng Date cho thời gian theo giờ nhập vào (7h sáng)
    const specificTime = new Date(year, month, day, inputHour, 0, 0, 0); // Sử dụng giờ nhập vào

    // Chuyển đổi thời gian sang Unix timestamp
    to = Math.floor(specificTime.getTime() / 1000);  // Chuyển đổi sang Unix timestamp
    from = to;  // Vì không có khoảng thời gian, `from` và `to` giống nhau (1 giờ cụ thể)
  } else {
    // Nếu không có thời gian, lấy giờ hiện tại làm đầu giờ (làm tròn về đầu giờ)
    const now = new Date();
    now.setMinutes(0);  // Làm tròn phút về 0
    now.setSeconds(0);  // Làm tròn giây về 0
    now.setMilliseconds(0);  // Làm tròn mili giây về 0

    // Chuyển đổi thời gian làm tròn sang Unix timestamp
    from = Math.floor(now.getTime() / 1000);  // Chuyển đổi sang Unix timestamp
    to = from;  // Vì không có thời gian cụ thể, `from` và `to` giống nhau
  }

  // In ra log để kiểm tra giá trị timestamp của 'from' và 'to'
  console.log("From (timestamp):", from);
  console.log("To (timestamp):", to);

  // Các hàm lấy dữ liệu thị trường khác như Funding Rate, Open Interest, v.v.
  const fundingResult = await fetchFundingRate(symbol, from, to);
  const oiResult = await fetchOpenInterest(symbol, from, to);
  const liquidationResult = await fetchLiquidationHistory(symbol, from, to);
  const longShortResult = await fetchLongShortRatio(symbol, from, to);
  const ohlcvResult = await fetchOhlcvHistory(symbol, from, to);

  // Xây dựng tin nhắn trả về cho người dùng
  let message = ""; // ✅ Thêm dòng này

  // Xử lý dữ liệu OHLCV (Open, High, Low, Close, Volume)
  if (ohlcvResult.success) {
    const open = ohlcvResult.open;
    const close = ohlcvResult.close;
    const volume = ohlcvResult.volume;
    const buyVolume = ohlcvResult.baseVolume;
    const sellVolume = volume - buyVolume;
  
    const percentChange = ((close - open) / open) * 100;
    const buyMorePercent = ((buyVolume - sellVolume) / sellVolume) * 100;
    const trend = buyMorePercent > 0 ? "⬆️" : "⬇️";
  
    const buyTx = ohlcvResult.buyTx;
    const sellTx = ohlcvResult.totalTx - buyTx;
    const buyMorePercentTx = ((buyTx - sellTx) / sellTx) * 100;
    const trendTx = buyMorePercentTx > 0 ? "⬆️" : "⬇️";
  
    const displaySymbol = symbol.toUpperCase();
  
    message += `⭐⭐⭐ <code><b><i>${displaySymbol}</i></b></code> ⭐⭐⭐\n`;
    message += `🔸 <b>Price:</b> ${close}\n`;
    message += `🚀 <b>PriceChange:</b> ${percentChange.toFixed(1)}%\n`;
    message += `╰┈➤<a href="https://www.coinglass.com/tv/vi/Binance_${displaySymbol}"> Coinglass </a>\n`;
    message += `  ↳ <b>Volume:</b> ${volume.toLocaleString()} || ${trend} ${buyMorePercent.toFixed(1)}%\n`;
    message += `  ↳ <b>Buy:</b> ${buyVolume.toLocaleString()} || 📉 <b>Sell:</b> ${sellVolume.toLocaleString()}\n`;
    message += `  ↳ <b>TxBuy:</b> ${trendTx} ${buyMorePercentTx.toFixed(1)}%\n\n`;
  }



  // Xử lý dữ liệu Funding Rate
  if (fundingResult.success) {
    message += `≫ <b>Funding Rate</b>: <i>${fundingResult.close}</i>\n\n`;
  }

  // Xử lý Open Interest
  if (oiResult.success) {
    const currentOpenInterest = oiResult.history[0].close;  // Lấy giá trị OI hiện tại
    const previousOpenInterest = oiResult.history.length > 1 ? oiResult.history[1].close : currentOpenInterest;  // Lấy giá trị OI trước đó (nếu có)

    // Tính phần trăm thay đổi của Open Interest
    const oiChangePercent = ((currentOpenInterest - previousOpenInterest) / previousOpenInterest) * 100;
    const oiChange = oiChangePercent >= 0 ? `⏫ +${oiChangePercent.toFixed(2)}%` : `⏬ ${oiChangePercent.toFixed(2)}%`;

    message += `ᯓ★ Open Interest: <i>${oiChange}</i>\n`;
    message += `   ↳ Open: <i>${Math.round(oiResult.history[0].open).toLocaleString('vi-VN')}</i>\n`;
    message += `   ↳ Close: <i>${Math.round(currentOpenInterest).toLocaleString('vi-VN')}</i>\n\n`;
  }
// Xử lý dữ liệu Long-Short Ratio
if (longShortResult.success) {
  const current = longShortResult.history[0];

  message += `➤ <b>Long-Short Ratio</b>: <i>${current.ratio.toFixed(2)}</i>\n`;
  message += `   ↳ Long: <i>${current.long.toFixed(1)}%</i>\n`;
  message += `   ↳ Short: <i>${current.short.toFixed(1)}%</i>\n\n`;

}
  // Xử lý dữ liệu Liquidation
  if (liquidationResult.success) {
    const current = liquidationResult.history[0];
    message += ` ✔ <b>Liquidation</b>:\n`;
    message += `   ↳ Long: <i>${Math.round(current.long).toLocaleString('vi-VN')}</i> || Short: <i>${Math.round(current.short).toLocaleString('vi-VN')}</i>\n`;
  }else {
    message += `${liquidationResult.error}\n\n`;
  }
  // Gửi tin nhắn cho người dùng
  ctx.reply(message, { parse_mode: 'HTML' });
}



// Tách tên coin và thời gian (nếu có) - Phiên bản mới


const extractCoinSymbolAndTime = (text) => {
  console.log("Input text: ", text);

  const upper = text.toUpperCase().trim();  // Chuyển tất cả về chữ hoa

  // Trường hợp chỉ có coin (vd: 1000PEPE, API3)
  if (/^[A-Z0-9]{1,10}$/.test(upper)) {
    return { symbol: upper, time: null };
  }

  // Trường hợp có coin + giờ (vd: 1000PEPE 7 hoặc API3 7h)
  const matches = upper.match(/^([A-Z0-9]{1,10})\s*(\d{1,2})h?$/);
  console.log("Matches: ", matches);

  const symbol = matches?.[1] || null;
  const time = matches?.[2] ? parseInt(matches[2]) : null;

  // Kiểm tra nếu giờ không nằm trong khoảng 0–23
  if (time !== null && (time < 0 || time > 23)) {
    return { symbol, time: 'invalid' }; // Gắn 'invalid' để xử lý riêng
  }

  console.log("Symbol: ", symbol, " Time: ", time);
  return { symbol, time };
};




bot.on("text", async (ctx) => {
  const { symbol, time } = extractCoinSymbolAndTime(ctx.message.text);

  if (!symbol) {
    ctx.reply("❌ Vui lòng nhập tên coin hợp lệ (ví dụ: BTC hoặc BTC 7h).");
    return;
  }

  if (time === 'invalid') {
    ctx.reply("❌ Giờ bạn nhập không hợp lệ. Vui lòng nhập số từ 0 đến 23 (ví dụ: BTC 7h).");
    return;
  }

  await sendFullMarketDataMessage(ctx, symbol, time);
});





bot.launch();
console.log("🤖 Bot đã chạy thành công!");
