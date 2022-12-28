import { db } from '../server/DB/index.js';

class DbProvider {
  db = db;

  connect = async () => {
    let attemts = 10;
    let intervalId = setInterval(async () => {
      const isCanRetry = attemts > 0;
      let message = '';
      try {
        if (!isCanRetry) {
          clearInterval(intervalId);
          throw new Error('Error connection db! Attemtions ends!');
        }
        attemts--;
        await this.db.sequelize.authenticate();
        message = 'DB connection success!';

        clearInterval(intervalId);
      } catch (error) {
        message = isCanRetry
          ? `Connection error: ${error.message}\nTrying to reconnect...`
          : `Create connection error: ${error.message}`;
      } finally {
        console.log(message);
      }
    }, 1000);
  };
}

export default new DbProvider();
