import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ArchivedReport = sequelize.define(
    "ArchivedReport",
    {
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
      // Link eksternal (opsional)
      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // URL/path ke file gambar/video
      document: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      // Salin penjelasan admin juga
      adminExplanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Pemilik laporan (FK ke Users)
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
      // Waktu arsip
      archivedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "ArchivedReports",
      timestamps: true,
    }
  );

  ArchivedReport.associate = (models) => {
    ArchivedReport.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return ArchivedReport;
};
