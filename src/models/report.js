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
    // Field untuk menyimpan URL atau path file upload (opsional)
    document: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: "Reports",
    timestamps: true,
  });

  return Report;
};
