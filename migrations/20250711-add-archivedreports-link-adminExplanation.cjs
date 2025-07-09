'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tambah kolom link untuk ArchivedReports
    await queryInterface.addColumn('ArchivedReports', 'link', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // 2. Tambah kolom adminExplanation untuk ArchivedReports
    await queryInterface.addColumn('ArchivedReports', 'adminExplanation', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('ArchivedReports', 'adminExplanation');
    await queryInterface.removeColumn('ArchivedReports', 'link');
  }
};
