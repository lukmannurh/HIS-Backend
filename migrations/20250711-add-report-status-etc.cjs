'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tambah kolom reportStatus (diproses|selesai)
    await queryInterface.addColumn('Reports', 'reportStatus', {
      type: Sequelize.ENUM('diproses', 'selesai'),
      allowNull: false,
      defaultValue: 'diproses',
    });
    // 2. Tambah kolom adminExplanation
    await queryInterface.addColumn('Reports', 'adminExplanation', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    // 3. Tambah kolom autoArchive
    await queryInterface.addColumn('Reports', 'autoArchive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    // 4. Tambah kolom archiveThreshold (1month|3month|6month|1year)
    await queryInterface.addColumn('Reports', 'archiveThreshold', {
      type: Sequelize.ENUM('1month','3month','6month','1year'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Reports', 'archiveThreshold');
    await queryInterface.removeColumn('Reports', 'autoArchive');
    await queryInterface.removeColumn('Reports', 'adminExplanation');
    await queryInterface.removeColumn('Reports', 'reportStatus');
    // Buang ENUM types di Postgres
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Reports_reportStatus";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Reports_archiveThreshold";');
  }
};
