import express from 'express';
import DbProvider from '../services/DbProvider.js';
import ReportsUpdater from '../services/ReportsUpdater.js';
import { withMiddlewares } from './middlewares/withMiddlewares.js';
import { initRoutes } from './routes/index.js';

const app = express();
const port = process.env.PORT;

withMiddlewares(app);

initRoutes(app);

await DbProvider.connect();

ReportsUpdater.everyDayUpdateStart();

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port} port ${port}`);
});
