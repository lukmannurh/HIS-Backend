'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Reports', 'relatedNews', {
      type: Sequelize.JSON, // atau Sequelize.TEXT jika ingin menyimpan sebagai string
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reports', 'relatedNews');
  }
};
