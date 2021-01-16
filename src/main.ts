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
    `https://${url}/pubsub/${artistName}`,
    eventSourceInitDict,
  );
  es.onmessage = (e) => {
    console.log(`subscribers updated: ${e.data}`);
  };

  es.onopen = async () => {
    const publishUrl = `https://${url}/pubsub/${artistName}`;
    console.log(`subscribing to artist:${artistName}`);
    await got(publishUrl, {
      method: 'POST',
    });
  };
};

const main = async () => {
  try {
    createEventSource();
  } catch (error) {
    console.log(`ERROR: ${JSON.stringify(error, null, 4)}`);
  }
};

main();
