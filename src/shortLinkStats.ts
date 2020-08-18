const request = require('request');

export class ShortLinkStats{
    public static getStats(url): Promise<{ shorturl: string, url: string, timestamp: Date, clicks: number }> {
        const res = url.split("s.dpsg.de/");
        let shortUrl = res[res.length - 1];

        return new Promise((res, rej) => {
            request(`http://s.dpsg.de/yourls-api.php?signature=${process.env.URL_TOKEN}&action=url-stats&format=json&shorturl=${shortUrl}`, {}, (err, result, body) => {
                if (err) {
                    rej(err);
                    return;
                }
                body = JSON.parse(body);
                if (body.statusCode === 200)
                    res({
                        shorturl: body.link.shorturl,
                        url: body.link.url,
                        timestamp: body.link.timestamp, //'2020-07-28 13:58:06' -> 2020-07-28T11:58:06.000Z
                        clicks: Number(body.link.clicks)
                    });
                else
                    rej(body)

            });
        });
    }
}

