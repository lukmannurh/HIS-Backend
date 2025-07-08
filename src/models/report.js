import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Report = sequelize.define(
    "Report",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      validationStatus: {
        type: DataTypes.ENUM("valid", "hoax", "diragukan"),
        defaultValue: "diragukan",
      },
      validationDetails: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      relatedNews: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      // URL/path ke file gambar/video yang di-upload
      document: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Foreign key ke Users.id, wajib diisi
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "Reports",
      timestamps: true,
    }
  );

  // Association
  Report.associate = (models) => {
    Report.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Report;
};
