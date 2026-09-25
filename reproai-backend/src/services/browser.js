import { chromium } from 'playwright';
import { env } from '../config/env.js';

export const launchBrowser = () => chromium.launch(env.browserChannel ? { channel: env.browserChannel } : {});
