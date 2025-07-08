// migrations/20250708-add-rt-rw-to-users.cjs
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tambah kolom rt dengan default 1
    await queryInterface.addColumn('Users', 'rt', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,                // ← default
    });
    // Constraint rt antara 1–10
    await queryInterface.addConstraint('Users', {
      fields: ['rt'],
      type: 'check',
      name: 'users_rt_range_check',
      where: {
        rt: {
          [Sequelize.Op.gte]: 1,
          [Sequelize.Op.lte]: 10,
        },
      },
    });

    // Tambah kolom rw dengan default 13
    await queryInterface.addColumn('Users', 'rw', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 13,               // ← default
    });
    // Constraint rw hanya 13 atau 16
    await queryInterface.addConstraint('Users', {
      fields: ['rw'],
      type: 'check',
      name: 'users_rw_enum_check',
      where: {
        rw: {
          [Sequelize.Op.in]: [13, 16],
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'users_rw_enum_check');
    await queryInterface.removeConstraint('Users', 'users_rt_range_check');
    await queryInterface.removeColumn('Users', 'rw');
    await queryInterface.removeColumn('Users', 'rt');
  }
};
