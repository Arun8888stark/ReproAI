import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/screenshots', express.static(path.join(env.storageDir, 'screenshots')));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
