import express from 'express';
import { app as coinCollectionApi } from './server/app.js';

const app = express();
app.use(coinCollectionApi);

export default app;
