const nodeBot = require('telegraf');
const session = require('telegraf/session');
const Telegram = require('telegraf/telegram');

export class Stats {
    telegraf;
    telegram;


    constructor() {
        this.telegraf = new nodeBot(process.env.BOT_ID);
        this.telegraf.use(session());

        this.telegram = new Telegram(process.env.BOT_ID);
    }

    async getChannelFollowerCount(): Promise<number> {
        const follower = await this.telegram.getChatMembersCount(process.env.CHANNEL_ID);
        console.log(`Current channel user: ${follower}`);
        return follower
    }

    getChannelId(): Promise<number> {
        return new Promise(async (res, rej) => {
            this.telegraf.on('message', async ctx => {
                console.log(ctx.update.message.forward_from_chat);
                res(ctx.update.message.forward_from_chat);
            });
            await this.telegraf.launch();
            console.log('Forward message from Channel to @dpsg_channel_stats_bot')
        })
    }
}

