"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Pastikan kolom userId tidak boleh null
    await queryInterface.changeColumn("Reports", "userId", {
      type: Sequelize.UUID,
      allowNull: false,
    });
    // 2. Tambah foreign key constraint ke Users.id
    await queryInterface.addConstraint("Reports", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_reports_userId_users_id",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    // Hapus constraint lalu kembalikan kolom seperti semula
    await queryInterface.removeConstraint(
      "Reports",
      "fk_reports_userId_users_id"
    );
    await queryInterface.changeColumn("Reports", "userId", {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
};
