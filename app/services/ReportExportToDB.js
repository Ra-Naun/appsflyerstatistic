import fs from 'fs';
import { parse } from 'fast-csv';
import DbProvider from './DbProvider.js';
import { getDateStr, shiftDate } from '../utils/date.js';

class ReportExportToDB {
  #getCsvData = async reportName => {
    if (!reportName) throw new Error('Invalid reportName');

    const csvData = [];
    const filePath = `reports/${reportName}`;

    // вот тут при отсутствии файла крашится прога на неотловленном исключении. Отловить не получилось, если будет нужно, то поменять подход - сначала открывать файл, а потом сюда уже сам контент прокидывать
    const message = await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on('error', error => reject(error))
        .on('data', row => csvData.push(row))
        .on('end', (rowCount = 0) => {
          fs.unlinkSync(filePath);
          if (rowCount >= 999999)
            throw new Error(
              'The limit of 1,000,000 uploads at a time has been reached. This is a limitation of the "appsflyer" platform. Resubmit the query with a smaller date range "from" "to"!'
            );
          resolve(`Loaded ${rowCount} records`);
        });
    });

    return { message, csvData };
  };

  #saveReportStats = async params => {
    const { appID, from, to, reattr, event_name, geo, source } = params;

    // если '2022-12-15 14:30' - оставляем только год-месяц-день
    const fromWithoutTime = from.split(' ')[0];
    const toWithoutTime = to.split(' ')[0];

    const fromDate = new Date(fromWithoutTime);
    const toDate = new Date(toWithoutTime);

    // кол-во дней между датами
    const deltaDays = (toDate - fromDate) / (1000 * 60 * 60 * 24) + 1;

    for (let i = 0; i < deltaDays; i++) {
      const currentDate = shiftDate(fromDate, i);

      const paramsOnDay = {
        date: getDateStr(currentDate),
        appID,
        geo,
        reattr,
        source,
      };

      const savesOnThisDate = await DbProvider.db.AppsflyerReportsSaves.findAll({
        where: paramsOnDay,
        raw: true,
      });

      let isExistSaves = !!savesOnThisDate?.length;

      if (isExistSaves) {
        for (const saveOnThisDate of savesOnThisDate) {
          const uniqNames = new Set([
            ...saveOnThisDate.event_name.split(','),
            ...event_name.split(','),
          ]);

          const newEventNames = Array.from(uniqNames).join(',');

          await DbProvider.db.AppsflyerReportsSaves.upsert({
            ...paramsOnDay,
            event_name: newEventNames,
            id: saveOnThisDate.id,
          });
        }
      } else {
        await DbProvider.db.AppsflyerReportsSaves.create({ ...paramsOnDay, event_name });
      }
    }
  };

  saveReportInDB = async (reportName, reportStatParams) => {
    const { message, csvData } = await this.#getCsvData(reportName);
    const { source } = reportStatParams;

    if (!csvData) throw new Error(message);

    const parsedCsvData = csvData.reduce((acc, row) => {
      let parsedData;

      try {
        parsedData = JSON.parse(row['Event Value']);
      } catch (error) {
        // в README про invalidJson есть
        parsedData = { invalidJson: row['Event Value'] };
      }

      acc.push({ ...row, 'Event Value': parsedData, source });

      return acc;
    }, []);

    await this.#saveReportStats(reportStatParams);

    // для вставки больших данных (10к+ записей) использование оперативы улетает в небеса, решил дробить данные в цикле для вставки фрагментами

    const { length } = parsedCsvData;
    const lengthPart = 5000;
    const parts = Math.ceil(length / lengthPart);

    for (let slicePart = 0; slicePart < parts; slicePart++) {
      const sliceStart = slicePart * lengthPart;

      const sliceEnd =
        length > (slicePart + 1) * lengthPart ? (slicePart + 1) * lengthPart : length;

      const parsedCsvDataSlice = parsedCsvData.slice(sliceStart, sliceEnd);

      await DbProvider.db.AppsflyerReports.bulkCreate(parsedCsvDataSlice);
    }

    return message;
  };
}

export default new ReportExportToDB();
