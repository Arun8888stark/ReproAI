import express from 'express';
import path from 'node:path';
import app from './app.js';
import { env } from './config/env.js';

process.on('unhandledRejection', err => console.error('Unhandled error:', err));

const HOST = '0.0.0.0';

const start = (server, name, port) =>
  server.listen(port, HOST, err => {
    if (err) {
      console.error(`${name} could not start on port ${port}: ${err.message}`);
      process.exit(1);
    }
    console.log(`${name} running at http://localhost:${port}`);
  });

start(app, 'API', env.port);
start(express().use(express.static(path.resolve('demo-app'))), 'Demo app', env.demoPort);
console.log('Keep this terminal open. Press Ctrl+C to stop.');