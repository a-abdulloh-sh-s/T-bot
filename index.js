import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const WEBHOOK_PATH = '/bot';
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !ADMIN_ID) {
  console.error('BOT_TOKEN yoki ADMIN_ID set qilinmagan');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

// Webhook endpoint
app.use(bot.webhookCallback(WEBHOOK_PATH));

// Telegram serverga webhook URL ni bildirish
bot.telegram.setWebhook(`https://your-render-url.onrender.com${WEBHOOK_PATH}`);

// /start komandasi
bot.start(async (ctx) => {
  await ctx.reply(
    "Assalomu alykum \nbu \nAbdullohning boti, habaringizni yozing birozdan so'ng uning o'zi javob beradi",
    Markup.keyboard([['Salom']]).resize()
  );
});

// Har bir user xabarini admin'ga forward qilish
bot.on('message', async (ctx) => {
  const userId = ctx.from.id;
  const userName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
  const username = ctx.from.username ? `@${ctx.from.username}` : '(username yo‘q)';
  const text = ctx.message.text || '(media/xabar)';

  await bot.telegram.sendMessage(
    ADMIN_ID,
    `Yangi xabar:\n- UserID: ${userId}\n- Ism: ${userName}\n- Username: ${username}\n- Matn: ${text}\n\nJavob berish: /reply ${userId} <javob matni>`
  );
});

// Admin uchun /reply komanda
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
    await ctx.reply('Yuborishda xato. User botni bloklagan yoki ID noto‘g‘ri bo‘lishi mumkin.');
  }
});

// Admin ID ni ko‘rish uchun
bot.command('me', async (ctx) => {
  await ctx.reply(`Sizning chat ID: ${ctx.from.id}`);
});

// Express serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
