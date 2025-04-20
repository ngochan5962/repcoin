const { Telegraf } = require("telegraf");
const { BOT_TOKEN } = require("./config");
const { sendFullMarketDataMessage } = require("./services/messageService");
const { extractCoinSymbolAndTime } = require("./services/timeService");

const bot = new Telegraf(BOT_TOKEN);

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
