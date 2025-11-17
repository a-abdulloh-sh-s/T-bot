import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID; // sening chat ID'ing
if (!BOT_TOKEN || !ADMIN_ID) {
  console.error('BOT_TOKEN yoki ADMIN_ID set qilinmagan');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// /start
bot.start(async (ctx) => {
  await ctx.reply(
    "Assalou aleykum \nbu Abdullohning  LiveChat boti \nhabaringizni qoldiring uning ozi javob beradi",
    Markup.keyboard([['salom']]).resize()
  );
});

// Admin uchun /reply komanda: /reply <userId> <text>
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

// Har bir user xabarini admin'ga forward qilamiz
bot.on('message', async (ctx) => {
  const userId = ctx.from.id;
  const userName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
  const username = ctx.from.username ? `@${ctx.from.username}` : '(username yo‘q)';
  const text = ctx.message.text || '(media/xabar)';

  // Admin uchun sarlavha xabari (kim yozdi)
  await bot.telegram.sendMessage(
    ADMIN_ID,
    `Yangi xabar:\n- UserID: ${userId}\n- Ism: ${userName}\n- Username: ${username}\n- Matn: ${text}\n\nJavob berish: /reply ${userId} <javob matni>`
  );
});

// Admin ID ni topish uchun (bir marta) o‘zing botga yoz, keyin shuni yoqib ko‘r:
bot.command('me', async (ctx) => {
  await ctx.reply(`Sizning chat ID: ${ctx.from.id}`);
});

// Botni ishga tushirish (polling)
bot.launch().then(() => {
  console.log('Bot ishlamoqda...');
}).catch((e) => {
  console.error('Bot launch xato:', e);
});

// Graceful stop (Render yoki server to‘xtaganda)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));