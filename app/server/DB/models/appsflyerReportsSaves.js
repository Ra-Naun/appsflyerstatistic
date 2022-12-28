export default (sequelize, DataTypes) =>
  sequelize.define(
    'AppsflyerReportsSaves',
    {
      appID: DataTypes.STRING,
      event_name: DataTypes.TEXT,
      date: DataTypes.STRING,
      geo: DataTypes.STRING,
      reattr: DataTypes.BOOLEAN,
      source: DataTypes.STRING,
    },
    {
      tableName: 'appsflyerReportsSaves',
      timestamps: false,
      sequelize,
    }
  );
