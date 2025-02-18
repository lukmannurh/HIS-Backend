'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tambahkan kolom "userId" sebagai nullable
    await queryInterface.addColumn('ArchivedReports', 'userId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    
    // 2. Ambil ownerId dari tabel Users (misalnya, gunakan user dengan role 'owner')
    const [results] = await queryInterface.sequelize.query(
      "SELECT id FROM \"Users\" WHERE role = 'owner' LIMIT 1"
    );
    if (!results.length) {
      throw new Error("Tidak ada owner ditemukan untuk update ArchivedReports");
    }
    const ownerId = results[0].id;
    
    // 3. Update semua baris di ArchivedReports yang userId masih null
    await queryInterface.sequelize.query(
      `UPDATE "ArchivedReports" SET "userId" = '${ownerId}' WHERE "userId" IS NULL`
    );
    
    // 4. Ubah kolom tersebut agar tidak boleh null
    await queryInterface.changeColumn('ArchivedReports', 'userId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ArchivedReports', 'userId');
  }
};
