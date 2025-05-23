const fetchFundingRate = require("../api/fetchFundingRate");
const fetchOpenInterest = require("../api/fetchOpenInterest");
const fetchLiquidationHistory = require("../api/fetchLiquidationHistory");
const fetchLongShortRatio = require("../api/fetchLongShortRatio");
const fetchOhlcvHistory = require("../api/fetchOhlcvHistory");

// Chức năng chuyển đổi timestamp thành giờ Việt Nam
function convertToVietnamTime(timestamp) {
  // Kiểm tra xem timestamp có hợp lệ không
  if (isNaN(timestamp) || timestamp <= 0) {
      console.error('Timestamp không hợp lệ:', timestamp); // In ra để kiểm tra
      return '🕒 Thời gian không hợp lệ';
  }

  const date = new Date(timestamp * 1000); // Chuyển timestamp từ giây thành milliseconds

  // Kiểm tra nếu giá trị date không hợp lệ
  if (isNaN(date.getTime())) {
      console.error('Ngày không hợp lệ:', date); // In ra nếu ngày không hợp lệ
      return '🕒 Thời gian không hợp lệ';
  }

  const options = {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
  };

  try {
      const formattedTime = new Intl.DateTimeFormat('vi-VN', options).format(date);

      // Tách giờ, ngày tháng năm từ kết quả định dạng
      const [hour, minute, second] = formattedTime.split(' ')[0].split(':');
      const [day, month, year] = formattedTime.split(' ')[1].split('/');

      // Trả về kết quả theo yêu cầu
      return `🕒 Cập nhật: ${hour}:${minute}:${second} ${day}/${month}/${year}`;
  } catch (error) {
      console.error("Lỗi khi chuyển đổi thời gian:", error);
      return '🕒 Thời gian không hợp lệ';
  }
}






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
// Chức năng chuyển đổi timestamp thành giờ Việt Nam


// Xử lý dữ liệu Liquidation
// Xử lý dữ liệu Liquidation
if (liquidationResult.success) {
  const current = liquidationResult.history[0];
  

  
  // Chuyển đổi timestamp thành giờ Việt Nam
  const vietnamTime = convertToVietnamTime(current.timestamp);

  // Thêm thông tin vào message
  message += `✔ <b>Liquidation</b>:\n`;
  message += `   ↳ Long: <i>${Math.round(current.long).toLocaleString('vi-VN')}</i> || Short: <i>${Math.round(current.short).toLocaleString('vi-VN')}</i>\n`;
  message += `   ↳ <i>${vietnamTime}</i>\n`; // Thêm thông tin thời gian vào
} else {
  message += `${liquidationResult.error}\n\n`;
}

  
  

  // Gửi tin nhắn cho người dùng
  ctx.reply(message, { parse_mode: 'HTML' });
}

module.exports = { sendFullMarketDataMessage };
