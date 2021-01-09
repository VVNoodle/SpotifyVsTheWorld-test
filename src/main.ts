import * as EventSource from 'eventsource';
import got from 'got';

/**
 * change artistName & url
 * example:
 *  - artistName = "gorillaz"
 *  - url = "url of pub/sub server"
 **/
const artistName = process.argv[3] ? process.argv[3] : 'random_artist';
const url = process.argv[2];

const createEventSource = () => {
  const eventSourceInitDict = { https: { rejectUnauthorized: false } };
  const es = new EventSource(
    `https://${url}/sub/${artistName}`,
    eventSourceInitDict,
  );
  es.onmessage = (e) => {
    console.log(`subscribers updated: ${e.data}`);
  };
};

console.log(`subscribing to artist:${artistName}`);

const main = async () => {
  const publishUrl = `https://${url}/pub/${artistName}`;
  try {
    const { body } = await got(publishUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      http2: true,
    });
    const json: {
      messages: string;
      requested: string;
      subscribers: string;
      last_message_id: string;
    } = JSON.parse(body);

    const subscriberCount = parseInt(json.subscribers) + 1;
    console.log('new subscriber count: ', subscriberCount);

    await got(publishUrl, {
      method: 'POST',
      body: `c=${subscriberCount}`,
    });
    createEventSource();
  } catch (error) {
    console.log('no entry yet');
    const result = got(publishUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
      body: `c=1`,
    });
    console.log('result', await result.text());
    createEventSource();
  }
};

main();
