// Local embedded postgres for testing. Persistent.
import EmbeddedPostgres from 'embedded-postgres';

const pg = new EmbeddedPostgres({
  databaseDir: './data/local-pg',
  user: 'postgres',
  password: 'postgres',
  port: 54329,
  persistent: true,
});

const cmd = process.argv[2];

if (cmd === 'init') {
  await pg.initialise();
  console.log('initialised');
  process.exit(0);
} else if (cmd === 'start') {
  await pg.start();
  try {
    await pg.createDatabase('pixeleco');
  } catch (e) {
    if (!String(e.message || e).match(/already exists/i)) throw e;
  }
  console.log('started on 54329');
  // Keep alive
  setInterval(() => {}, 1 << 30);
} else if (cmd === 'stop') {
  // Best-effort: pg.stop() needs a started instance; not used here.
  console.log('use kill on the background pid');
  process.exit(0);
} else {
  console.error('usage: init|start|stop');
  process.exit(1);
}
