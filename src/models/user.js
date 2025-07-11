import { DataTypes } from "sequelize";

const User = (sequelize) => {
  const UserModel = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "owner", "user"),
        defaultValue: "user",
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      photo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // === Tambahan RT dan RW ===
      rt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10,
        },
      },
      rw: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[13, 16]],
        },
      },
    },
    {
      tableName: "Users",
      timestamps: true,
    }
  );

  return UserModel;
};

export default User;
