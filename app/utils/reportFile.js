import { REPORT_SOURCES } from '../config/appsflyerReportSource.js';
import path from 'path';
import { getHash } from './getHash.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateFileName = ({ from, to, source, appID, event_name }) => {
  // слишком длинное название файла получается, система ругается, заюзал хэш
  const hash = getHash(event_name);

  switch (source) {
    case REPORT_SOURCES.DEFAULT: {
      return `Default-${appID}-${from}-to-${to}-${hash}.csv`;
    }

    case REPORT_SOURCES.ORGANIC: {
      return `Organic-${appID}-${from}-to-${to}-${hash}.csv`;
    }

    default:
      return '';
  }
};
