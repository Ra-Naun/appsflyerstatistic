import api from 'api';
import { generateFileName } from '../utils/reportFile.js';
import { REPORT_SOURCES } from '../config/appsflyerReportSource.js';
const sdk = api('@hc/v0.1#4mr0h1llbdkxfzq');

class ReportFetcher {
  fetchData = async (params, source) => {
    const { appID, apiToken, from, to, geo, event_name, reattr } = params;

    sdk.auth(apiToken);

    const requestParams = {
      from: from,
      to: to,
      event_name,
      reattr,
      geo,
      'app-id': appID,
      accept: 'text/csv',
    };

    let res;

    switch (source) {
      case REPORT_SOURCES.DEFAULT: {
        res = await sdk.getAppIdIn_app_events_reportV5(requestParams);
        break;
      }
      case REPORT_SOURCES.ORGANIC: {
        res = await sdk.getAppIdOrganic_in_app_events_reportV5(requestParams);
        break;
      }

      default:
        break;
    }

    const { data } = res;

    const fileName = generateFileName({
      from,
      to,
      source,
      appID,
      event_name,
    });

    return { fileName, data };
  };
}

export default new ReportFetcher();
