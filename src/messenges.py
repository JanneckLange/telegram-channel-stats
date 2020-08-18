import sys
import os
import json
import asyncio
import pytz

from datetime import date, datetime, timedelta

from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError
from telethon.tl.functions.messages import (GetHistoryRequest)
from telethon.tl.types import (PeerChannel)
from telethon.tl.types import (MessageEntityUrl)
from telethon.tl.types import (MessageEntityTextUrl)

utc=pytz.UTC

# some functions to parse json date
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()

        if isinstance(o, bytes):
            return list(o)

        return json.JSONEncoder.default(self, o)


# Setting configuration values
api_id = sys.argv[2]
api_hash = str(sys.argv[3])
phone = sys.argv[4]
username = sys.argv[5]
channel_id = sys.argv[6]
threeDayOldOnly = False
try:
    threeDayOldOnly = sys.argv[1] == true
except:
    threeDayOldOnly = False


# Create the client and connect
client = TelegramClient(username, api_id, api_hash)

def messageToObject(message):
    media = None
    url = None
    entity = list()
    if hasattr(message.media, 'webpage'):
        media = message.media.webpage.type
        url = message.media.webpage.url
        if media == "photo" and hasattr(message.media.webpage, 'url'):
            media = 'url'
    elif hasattr(message.media, 'photo'):
        media = "photo"
    if message.entities:
        for e in message.entities:
            if isinstance(e, MessageEntityUrl) or isinstance(e, MessageEntityTextUrl):
                entity.append(e.to_dict())
    return {
        "id": message.id,
        "date": message.date.strftime("%Y-%m-%d"),
        "time": message.date.strftime("%H:%M:%S"),
        "datetime": message.date.strftime("%Y-%m-%d %H:%M:%S"),
        "views": message.views,
        "message": message.message,
        "silent":message.silent,
        "media":media,
        "url": url,
        "entities": entity
    }

def writeMessagesToFile(all_messages):
    path = None
    if os.path.exists("./src/py/channel_messages.json"):
        path = "./src/py/channel_messages.json"
    else:
        path = "./channel_messages.json"

    with open(path, 'w') as outfile:
        json.dump(all_messages, outfile, cls=DateTimeEncoder)


async def main(phone):
    await client.start()
    # Ensure you're authorized
    if await client.is_user_authorized() == False:
        await client.send_code_request(phone)
        try:
            await client.sign_in(phone, input('Enter the code: '))
        except SessionPasswordNeededError:
            await client.sign_in(password=input('Password: '))

    my_channel = await client.get_entity(PeerChannel(int(channel_id)))

    offset_id = 0
    limit = 100
    all_messages = []
    total_messages = 0
    total_count_limit = 0

    while True:
        history = await client(GetHistoryRequest(
            peer=my_channel,
            offset_id=offset_id,
            offset_date=None,
            add_offset=0,
            limit=limit,
            max_id=0,
            min_id=0,
            hash=0
        ))
        if not history.messages:
            break
        messages = history.messages
        for message in messages:
            time_max = utc.localize(datetime.now() - timedelta(hours=72))
            time_min = utc.localize(datetime.now() - timedelta(hours=70))
            if message.date > time_max and message.date < time_min:
                all_messages.append(messageToObject(message))
            elif message.date > time_max and not threeDayOldOnly:
                all_messages.append(messageToObject(message))
            else:
                break

        offset_id = messages[len(messages) - 1].id
        total_messages = len(all_messages)
        if total_count_limit != 0 and total_messages >= total_count_limit:
            break

    writeMessagesToFile(all_messages)

with client:
    client.loop.run_until_complete(main(phone))
