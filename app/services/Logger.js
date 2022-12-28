import * as fs from '../utils/fs.js';

class Logger {
  saveLog = async (message = '', logPath = '') => {
    await fs.appendFile(logPath, `${message}\n`);
  };

  getLogs = async (logPath = '') => {
    const logsRaw = (await fs.readFile(logPath)) || '';

    const logsArr = logsRaw.split('\n');

    const logs =
      logsArr
        .filter(log => !!log)
        .map(log => {
          try {
            return JSON.parse(log);
          } catch {
            return log;
          }
        }) || [];

    return logs.reverse();
  };
}

export default new Logger();
