import { defaultParams, from, to, geo } from '../../config/appsflyerDefaultParams.js';
import { fetchDataLogFilePath } from '../../config/logs.js';
import Logger from '../../services/Logger.js';
import { prettyHtml } from '../../utils/prettyHtml.js';
import { fetchAppsflyerDataController } from '../controllers/fetchAppsflyerData.js';

export const initRoutes = app => {
  app.get('/api/get-default-form-params', (req, res) => {
    const conf = {
      ...defaultParams,
      from,
      to,
      geo,
    };

    res.send(conf);
  });

  app.get('/api/get-fetch-data-logs', async (req, res) => {
    const logs = await Logger.getLogs(fetchDataLogFilePath);

    res.send({ logs, html: prettyHtml(logs) });
  });

  app.get('/api/fetch-appsflyer-data', async (req, res) => {
    const { query } = req;

    const message = await fetchAppsflyerDataController(query);

    return res.send({ message, html: prettyHtml(message) });
  });
};
