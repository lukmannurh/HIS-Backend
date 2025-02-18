import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ArchivedReport = sequelize.define("ArchivedReport", {
    id: {
      type: DataTypes.UUID,
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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "unknown",
    },
    validationDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    relatedNews: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // Menyimpan siapa pemilik laporan (agar user dapat melihat arsip miliknya)
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: "ArchivedReports",
    timestamps: true,
  });

  return ArchivedReport;
};
