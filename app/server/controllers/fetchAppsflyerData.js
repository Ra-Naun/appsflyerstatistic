import { defaultParams } from '../../config/appsflyerDefaultParams.js';
import { fetchDataLogFilePath } from '../../config/logs.js';
import Logger from '../../services/Logger.js';
import ReportCSVSaver from '../../services/ReportCSVSaver.js';
import ReportExportToDB from '../../services/ReportExportToDB.js';
import ReportFetcher from '../../services/ReportFetcher.js';
import { prepareRequestParams } from '../../utils/validators/requestParams.js';

let isFetching = false;

const load = async reqQuery => {
  const params = { ...defaultParams, ...reqQuery };

  const { appID, from, to, event_name, geo, apiToken, reattr = false } = params;

  const { source } = params;

  let message = {};

  const prepareParams = { appID, from, to, event_name, geo, apiToken, reattr, source };

  const availableParams = await prepareRequestParams(prepareParams);

  message.requests = {
    url: source,
    params: availableParams,
  };

  for (const idx in availableParams) {
    try {
      const availableParam = availableParams[idx];
      const result = await ReportFetcher.fetchData(availableParam, source);
      if (!result.fileName || !result.data) throw new Error('Error fetching data');

      await ReportCSVSaver.saveReportInCSV(result);

      let msg = `Generated file ${result.fileName}`;
      message.logs ? message.logs.push(msg) : (message.logs = [msg]);

      const { appID, from, to, reattr, event_name, geo } = availableParam;

      const reportStatParams = { appID, from, to, reattr, event_name, geo, source };

      msg = await ReportExportToDB.saveReportInDB(result.fileName, reportStatParams);
      message.logs ? message.logs.push(msg) : (message.logs = [msg]);

      msg = `Saved in db file ${result.fileName}`;
      message.logs.push(msg);

      msg = `Remove file ${result.fileName}`;
      message.logs.push(msg);
    } catch (error) {
      const msg = error.message;
      message.logs ? message.logs.push(msg) : (message.logs = [msg]);
    }
  }

  return message;
};

export const fetchAppsflyerDataController = async query => {
  const { type = 'client' } = query;
  let message = { type: type };

  try {
    message.date = new Date();

    if (isFetching) {
      throw new Error('Data is being requested, please wait...');
    }

    isFetching = true;

    const params = { ...defaultParams, ...query };

    message = { ...message, ...(await load(params)) };
  } catch (error) {
    const msg = error.message;
    message.logs ? message.logs.push(msg) : (message.logs = [msg]);
  } finally {
    isFetching = false;

    message.elapsedTime = `${new Date() - message.date} ms`;

    const isNeedSaveLog =
      type === 'client' ||
      !!Object.keys((message?.requests?.params && message.requests.params) || {})?.length ||
      !!message?.logs;

    isNeedSaveLog && Logger.saveLog(JSON.stringify(message), fetchDataLogFilePath);

    return message;
  }
};
