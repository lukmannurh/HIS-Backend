import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'RefreshTokens',
    timestamps: true
  });

  return RefreshToken;
};
