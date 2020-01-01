'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dgram = require('dgram');
const throttle = require('throttle-debounce/throttle');
const argv = require('yargs')
  .usage('Usage: $0 --backend [address] [options]')
  .option('backend', {
    describe: 'Address of the flamepanel backend server',
    demandOption: true
  })
  .option('backport', {
    describe: 'Port that the flamepanel backend is running on',
    default: 1075
  })
  .option('port', {
    describe: 'Port to run the HTTP server on',
    default: 8080
  })
  .option('webroot', {
    describe: 'The root for web-accessible content, if desired'
  })
  .argv;

const app = express();
const client = dgram.createSocket('udp4');

const VERSION = 0;

app.use(bodyParser.json());

if (argv.webroot) {
  app.use(express.static(path.resolve(__dirname, argv.webroot)));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, argv.webroot, 'index.html'));
  });
}

app.post('/', (req, res) => {
  send(req.body);
  res.send('OK');
});

app.listen(argv.port, () => {
  console.log(`flame-http live on port ${argv.port}!`);
});

const send = throttle(100, input => {
  return new Promise((resolve, reject) => {
    let data = `${VERSION}\n${input.columns}\n${input.rows}${serializeRows(input.pattern)}`;
    client.send(data, argv.backport, argv.backend, function(err, bytes) {
      if (err) {
        console.error(`Error posting to band end at ${argv.backend}:${argv.backport}`, err);
        reject(err);
      }
      else {
        console.info(`Posted pattern to back end at ${argv.backend}:${argv.backport}`);
        console.info(data);
        resolve();
      }
    });
  });
});

function serializeRows(rows) {
  return rows.reduce((ret, val) => `${ret}\n${serializeCols(val)}`, '');
}

function serializeCols(cols) {
  return cols.reduce((ret, val) => `${ret ? `${ret}` : ''}${val ? '1' : '0'}`, '');
}
