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
      // Link eksternal (opsional)
      link: {
        type: DataTypes.STRING,
        allowNull: true,
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
      // Foreign key ke Users.id
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

      // ======== Fitur Baru ========
      // Status bisnis laporan
      reportStatus: {
        type: DataTypes.ENUM("diproses", "selesai"),
        allowNull: false,
        defaultValue: "diproses",
      },
      // Penjelasan admin saat mengubah status menjadi 'selesai'
      adminExplanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Opsi auto-arsip
      autoArchive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Threshold untuk auto-arsip: '1month', '3month', '6month', '1year'
      archiveThreshold: {
        type: DataTypes.ENUM("1month", "3month", "6month", "1year"),
        allowNull: true,
      },
    },
    {
      tableName: "Reports",
      timestamps: true,
    }
  );

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
