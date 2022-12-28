import { defaultParams, geo } from '../config/appsflyerDefaultParams.js';
import { REPORT_SOURCES } from '../config/appsflyerReportSource.js';
import { fetchAppsflyerDataController } from '../server/controllers/fetchAppsflyerData.js';
import { getDateStr } from '../utils/date.js';

class ReportsUpdater {
  #intervalId = null;
  #intervalTime = 1000 * 60 * 60 * 2;

  #commonParams = { ...defaultParams, geo };
  #paramsOrganic = { ...this.#commonParams, source: REPORT_SOURCES.ORGANIC };
  #paramsDefault = { ...this.#commonParams, source: REPORT_SOURCES.DEFAULT };

  #updateLogs = async () => {
    const dateNow = new Date();
    const from = getDateStr(dateNow, -1);
    const to = getDateStr(dateNow, -1);
    const localParams = { from, to, type: 'server' };

    try {
      const paramsOrganic = { ...this.#paramsOrganic, ...localParams };
      await fetchAppsflyerDataController(paramsOrganic);

      const paramsDefault = { ...this.#paramsDefault, ...localParams };
      await fetchAppsflyerDataController(paramsDefault);
    } catch (error) {
      console.log(error);
    }
  };

  everyDayUpdateStart = async () => {
    await this.#updateLogs();
    this.#intervalId = setInterval(this.#updateLogs, this.#intervalTime);
  };
}

export default new ReportsUpdater();
