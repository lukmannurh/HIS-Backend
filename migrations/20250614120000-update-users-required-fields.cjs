'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update baris dengan email null menjadi nilai placeholder unik
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "email" = CONCAT('unknown-', "id", '@example.com')
      WHERE "email" IS NULL
    `);

    // Update baris dengan fullName null menjadi 'Unknown'
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "fullName" = 'Unknown'
      WHERE "fullName" IS NULL
    `);

    // Ubah kolom email agar tidak boleh null dan unik
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    // Ubah kolom fullName agar tidak boleh null
    await queryInterface.changeColumn('Users', 'fullName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Kembalikan agar kolom email boleh bernilai null
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    // Kembalikan agar kolom fullName boleh bernilai null
    await queryInterface.changeColumn('Users', 'fullName', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
