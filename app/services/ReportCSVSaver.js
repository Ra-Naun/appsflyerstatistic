import fs from 'fs/promises';

class ReportCSVSaver {
  saveReportInCSV = async params => {
    const { fileName, data } = params;
    await fs.writeFile(`reports/${fileName}`, data);
    console.log('File was saved');
  };
}

export default new ReportCSVSaver();
