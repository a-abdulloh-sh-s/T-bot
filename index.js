import express from 'express';
import { Telegraf } from 'telegraf';
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

if (!BOT_TOKEN || !ADMIN_ID) {
  console.error('BOT_TOKEN yoki ADMIN_ID topilmadi');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;

// Webhook endpoint
app.use(bot.webhookCallback('/bot'));

// Telegram serverga webhook URL ni bildirish
bot.telegram.setWebhook(`https://your-render-url.onrender.com/bot`);

// Komandalar
bot.start((ctx) => ctx.reply("Assalomu alykum bu Abdullohning boti, habaringizni yozing birozdan so'ng uning o'zi javob beradi"));
// bot.command('me', (ctx) => ctx.reply(`Sizning chat ID: ${ctx.from.id}`));

// Javob komanda (admin uchun)
bot.command('reply', async (ctx) => {
  const isAdmin = String(ctx.from.id) === String(ADMIN_ID);
  if (!isAdmin) return ctx.reply('Siz admin emassiz.');

  const parts = ctx.message.text.split(' ');
  if (parts.length < 3) {
    return ctx.reply('Foydalanish: /reply <userId> <javob matni>');
  }
  const targetUserId = parts[1];
  const replyText = parts.slice(2).join(' ');

  try {
    await bot.telegram.sendMessage(targetUserId, replyText);
    await ctx.reply(`Yuborildi → ${targetUserId}`);
  } catch (err) {
    await ctx.reply('Xato: foydalanuvchi botni bloklagan yoki ID noto‘g‘ri.');
  }
});

// Express serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
