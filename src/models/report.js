import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Report = sequelize.define("Report", {
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
      type: DataTypes.STRING, // 'hoax', 'valid', 'unknown'
      defaultValue: "unknown",
    },
    validationDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    relatedNews: { // Field baru
      type: DataTypes.JSON, // Menyimpan sebagai JSON
      allowNull: true,
    },
  }, {
    tableName: "Reports",
    timestamps: true,
  });

  return Report;
};
