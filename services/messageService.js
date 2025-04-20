const fetchFundingRate = require("../api/fetchFundingRate");
const fetchOpenInterest = require("../api/fetchOpenInterest");
const fetchLiquidationHistory = require("../api/fetchLiquidationHistory");
const fetchLongShortRatio = require("../api/fetchLongShortRatio");
const fetchOhlcvHistory = require("../api/fetchOhlcvHistory");


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
  const openInterestOpen = oiResult.history[0].open;  // Giá trị Open Interest tại thời điểm "Open"
  const openInterestClose = oiResult.history[0].close;  // Giá trị Open Interest tại thời điểm "Close"

  // Tính phần trăm thay đổi giữa giá trị Open và Close
  const oiChangePercent = ((openInterestClose - openInterestOpen) / openInterestOpen) * 100;
  const oiChange = oiChangePercent >= 0 ? `⏫ +${oiChangePercent.toFixed(2)}%` : `⏬ ${oiChangePercent.toFixed(2)}%`;

  message += `ᯓ★ Open Interest: <i>${oiChange}</i>\n`;
  message += `   ↳ Open: <i>${Math.round(openInterestOpen).toLocaleString('vi-VN')}</i>\n`;
  message += `   ↳ Close: <i>${Math.round(openInterestClose).toLocaleString('vi-VN')}</i>\n\n`;
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
  
    // Tính thời gian VN từ timestamp
    const dateVN = new Date(current.timestamp * 1000);  // KHÔNG +7*3600

const hh = String(dateVN.getHours()).padStart(2, '0');
const mm = String(dateVN.getMinutes()).padStart(2, '0');
const ss = String(dateVN.getSeconds()).padStart(2, '0');
const day = dateVN.getDate();
const month = dateVN.getMonth() + 1;
const year = dateVN.getFullYear();

const formattedTime = `🕒 Cập nhật: ${hh}:${mm}:${ss} ${day}/${month}/${year}`;

  
    message += `✔ <b>Liquidation</b>:\n`;
    message += `   ↳ Long: <i>${Math.round(current.long).toLocaleString('vi-VN')}</i> || Short: <i>${Math.round(current.short).toLocaleString('vi-VN')}</i>\n`;
    message += `${formattedTime}\n`;

  } else {
    message += `${liquidationResult.error}\n\n`;
  }
  

  // Gửi tin nhắn cho người dùng
  ctx.reply(message, { parse_mode: 'HTML' });
}

module.exports = { sendFullMarketDataMessage };
