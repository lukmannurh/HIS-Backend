"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tambah kolom 'document' untuk menyimpan URL/path media
    await queryInterface.addColumn("ArchivedReports", "document", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    // Hapus kolom 'document'
    await queryInterface.removeColumn("ArchivedReports", "document");
  },
};
