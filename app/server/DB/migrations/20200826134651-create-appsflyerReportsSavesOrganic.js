// здесь храняться логи выгрузок данных из appsflyer. Нужно для проверки, выгружались ли в бд уже данные за определенный день, чтоб без дублей было.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appsflyerReportsSaves', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      appID: {
        type: Sequelize.STRING,
      },
      event_name: {
        type: Sequelize.TEXT,
      },
      date: {
        type: Sequelize.STRING,
      },
      geo: {
        type: Sequelize.STRING,
      },
      reattr: {
        type: Sequelize.BOOLEAN,
      },
      source: {
        type: Sequelize.STRING,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('appsflyerReportsSaves');
  },
};
