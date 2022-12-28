import { REPORT_SOURCES } from '../../config/appsflyerReportSource.js';
import DbProvider from '../../services/DbProvider.js';
import { getDateStr, shiftDate } from '../date.js';

const getAvailableParams = async params => {
  const { fromDate, deltaDays, appID, geo, apiToken, reattr, eventNames, source } = params;

  const availableParams = {};

  let key = 0;

  for (let i = 0; i < deltaDays; i++) {
    const currentDate = shiftDate(fromDate, i);
    const isLastIteration = i === deltaDays - 1;

    const isStartedTransaction = () => !!availableParams[key];
    const isEndedTransaction = () => !!availableParams[key].to;

    const currentDateStr = getDateStr(currentDate);

    if (!isStartedTransaction()) {
      const fetchParams = {
        appID,
        from: currentDateStr,
        to: null,
        reattr,
        event_name: [],
        geo,
        apiToken,
      };

      availableParams[key] = fetchParams;
    }

    const isFirstDayInInterval = availableParams[key].from === currentDateStr;

    const eventNamesLocal = [];

    for (let j = 0; j < eventNames.length; j++) {
      const eventName = eventNames[j];

      const paramsOnDay = {
        date: currentDateStr,
        appID,
        geo,
        reattr,
        source,
      };

      const savesOnThisDate = await DbProvider.db.AppsflyerReportsSaves.findAll({
        where: paramsOnDay,
        raw: true,
      });

      let isExistSaves = !!savesOnThisDate.length;

      if (isExistSaves) {
        isExistSaves = false;
        for (const saveOnThisDate of savesOnThisDate) {
          if (saveOnThisDate.event_name.split(',').includes(eventName)) {
            isExistSaves = true;
            break;
          }
        }
      }

      if (!isExistSaves) {
        eventNamesLocal.push(eventName);
      }
    }

    if (isFirstDayInInterval) {
      if (eventNamesLocal.length) {
        availableParams[key].event_name = eventNamesLocal;
      } else {
        delete availableParams[key];
      }
    } else {
      let isEqualEvents = eventNamesLocal.length === availableParams[key].event_name.length;

      const sortedEvNamesGlobal = availableParams[key].event_name.sort();
      const sortedEvNamesLocal = eventNamesLocal.sort();

      if (isEqualEvents) {
        for (const index in eventNamesLocal) {
          if (sortedEvNamesGlobal[index] !== sortedEvNamesLocal[index]) {
            isEqualEvents = false;
          }
        }
      }

      if (!isEqualEvents) {
        availableParams[key].to = getDateStr(currentDate, -1);
        key++;
        i--;
      }
    }

    if (isLastIteration) {
      if (isStartedTransaction() && !isEndedTransaction()) {
        availableParams[key].to = getDateStr(currentDate);
      }
      for (const key in availableParams) {
        if (Array.isArray(availableParams[key].event_name)) {
          availableParams[key].event_name = availableParams[key].event_name.join(',');
        }
      }
    }
  }

  return availableParams;
};

export const prepareRequestParams = async params => {
  const { appID, from, to, event_name, geo, apiToken, reattr } = params;

  const { source } = params;

  if (!appID || !apiToken || !event_name || !geo || !from || !to) {
    throw new Error('Invalid params');
  }

  if (from && to && from > to) {
    throw new Error('Invalid date interval, must be "from <= to"');
  }

  if (!Object.values(REPORT_SOURCES).includes(source)) {
    throw new Error('Unknown report source: ', source);
  }

  // если '2022-12-15 14:30' - оставляем только год-месяц-день
  const fromWithoutTime = from.split(' ')[0];
  const toWithoutTime = to.split(' ')[0];

  const fromDate = new Date(fromWithoutTime);
  const toDate = new Date(toWithoutTime);

  // кол-во дней между датами
  const deltaDays = (toDate - fromDate) / (1000 * 60 * 60 * 24) + 1;

  // проверка на валидность интервала
  if (deltaDays < 0) throw new Error('Date "from" is less than date "to"');
  if (deltaDays > 365) throw new Error('Date range too large');

  // common
  const eventNamesArr = event_name.split(',');

  const rawParams = {
    fromDate,
    deltaDays,
    appID,
    geo,
    apiToken,
    reattr,
    eventNames: eventNamesArr,
    source,
  };

  const availableParams = await getAvailableParams(rawParams);

  return availableParams;
};
