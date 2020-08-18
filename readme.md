# Telegram channel statistics

This project logs the view statistic for a single [Telegram](http://www.telegram.org) [Channel](https://www.telegram.org/faq#groups-and-channels)

## Setup
Environment:

| Variable name | value | description |
|---|---|---|
| DEBUG | true | start cron tasks direct |
| CHANNEL_ID | -74987123012 | ID of Channel ([How to get the ID](#how-to-get-the-channel-id) |
| BOT_TOKEN | 533794651:AAGDj1M93Oed328Srpp0E655zb1YZ5gqdVY | Bot Token for Follower Stats (create with [@BotFather](https://t.me/BotFather)) |
| URL_TOKEN | 5fhw1d5w4n | [YOURLS](https://yourls.org/) API Token |
| DB_PORT | 27017 | MongoDB Port (default=27017) |
| DB_URL | localhost | MongoDB Url (docker-compose app name) | 
| DB_NAME | company-channel-stats | MongoDB database name | 
| TELEGRAM_API_HASH | 65d1ht4f7f38ks947zz12ft27f82neza |  [Telegram API](https://core.telegram.org/api#telegram-api) hash (get it from [here](https://my.telegram.org/auth?to=apps)) |
| TELEGRAM_API_ID | 123456 | [Telegram API](https://core.telegram.org/api#telegram-api) ID (get it from [here](https://my.telegram.org/auth?to=apps)) | 
| TELEGRAM_PHONE | +49176123456 | Telegram phone number for [Telegram API](https://core.telegram.org/api#telegram-api) authentication  | 
| TELEGRAM_USERNAME | Jannecklange | Telegram username for [Telegram API](https://core.telegram.org/api#telegram-api) authentication |

### Start with Node.js

### Start with Docker

### How to get the Channel ID
text
