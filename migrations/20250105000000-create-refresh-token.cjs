'use strict';

/**
 * Migration: create-refresh-token
 * Membuat tabel RefreshTokens yang menyimpan token, userId, dan expiresAt
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshTokens', {
      token: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RefreshTokens');
  }
};
