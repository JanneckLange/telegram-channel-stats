import * as fs from 'fs';
import * as moment from 'moment';
import {ShortLinkStats} from "./shortLinkStats";
import {Mongo} from "./mongo";
import {Stats} from "./stats";

const stats = new Stats();

const debug = process.env.DEBUG === 'true';
const CronJob = require('cron').CronJob;
const telegramApiId = process.env.TELEGRAM_API_ID;
const telegramPhone = process.env.TELEGRAM_PHONE;
const telegramApiHash = process.env.TELEGRAM_API_HASH;
const telegramUsername = process.env.TELEGRAM_USERNAME;
const telegramChannelId = process.env.CHANNEL_ID;

function runPy(threeDayOldOnly: boolean) {
    const {spawn} = require('child_process');
    // [script, threeDay, api_id, api_hash, phone, username, channel_id]
    const process = spawn('python3', [
        'src/messenges.py',
        threeDayOldOnly,
        telegramApiId,
        telegramApiHash,
        telegramPhone,
        telegramUsername,
        telegramChannelId
    ]);
    // const process = spawn('python3', ['--version', threeDayOldOnly]);

    return new Promise((res, rej) => {
        process.stderr.on('data', (data) => {
            console.error(`stderr ${data.toString()}`);
            rej(data)
        });

        process.stdout.on('data', (data) => {
            console.error(`stdout ${data.toString()}`);
            res(data)
        });

        process.on('close', (code) => {
            console.log(`###################### child process exited with code ${code}`);
            code === 0 ? res() : rej(code);
        });
    });
}

async function checkForNewPosts() {
    let messages = JSON.parse(fs.readFileSync('./channel_messages.json', 'utf8'));
    if (messages.length === 0) {
        console.log('no messages found')
    }

    for (let messageEntity of messages) {
        if (!await Mongo.lookUpIdInScheduleDb(messageEntity.id)) {
            const m = moment(messageEntity.datetime).add(3, 'days');
            Mongo.storeScheduleToDb({
                _id: messageEntity.id,
                minute: m.minute(),
                hour: m.hour(),
                day: m.date(),
                month: m.month() + 1
            });

            const jobTime = `${m.minute()} ${m.hour()} ${m.date()} ${m.month() + 1} *`;
            const job = new CronJob(jobTime, () => {
                getAndStoreStats(messageEntity.id);
            });
            job.start();
            console.log(`Message ${messageEntity.id} job schedules for ${jobTime}`);
            if (debug) {
                console.info(`DEBUG: store stats directly (${messageEntity.id})`);
                getAndStoreStats(messageEntity.id)
            }
        }
    }
}

async function getAndStoreStats(id: number) {
    await runPy(true);
    let messages = JSON.parse(fs.readFileSync('./channel_messages.json', 'utf8'));
    for (let messageEntity of messages) {
        if (messageEntity.id === id) {
            messageEntity.linkStats = getLinkStats(messageEntity);
            messageEntity._id = id;
            delete messageEntity.id;
            delete messageEntity.date;
            delete messageEntity.time;
            Mongo.storeStatsToDb(messageEntity);
            Mongo.removeScheduleFromDb(id)
        }
    }
}

async function getLinkStats(messageEntity): Promise<Array<{ shorturl: string, url: string, timestamp: Date, clicks: number }>> {
    const urlStats = [];
    if (messageEntity.url && messageEntity.url.includes('s.dpsg.de')) {
        urlStats.push(await ShortLinkStats.getStats(messageEntity.url));
    }
    for (let entity of messageEntity.entities) {
        if (entity.url && entity.url.includes('s.dpsg.de')) {
            urlStats.push(await ShortLinkStats.getStats(messageEntity.url));
        }
    }

    return urlStats;
}

function startAllCroneJobs() {
    // todo start all crone jobs with db data
}

async function saveChannelFollowerStats() {
    Mongo.storeFollowerToDb(await stats.getChannelFollowerCount())
}

async function scheduledTask() {
    await runPy(false);
    await checkForNewPosts();
    await saveChannelFollowerStats();
}

function firstStart() {
    startAllCroneJobs();
}

// ###############################

firstStart();

const jobTime = '0 6 * * *';
const job = new CronJob(jobTime, async () => {
    await scheduledTask();
});
job.start();
console.log('Job Scheduled: ' + jobTime);

if (debug) {
    console.info(`DEBUG: start main without cron`);
    scheduledTask();
}
