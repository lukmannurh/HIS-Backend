import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

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
});

User.hasMany(Report, {
  foreignKey: "userId",
  as: "reports",
});
Report.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Report;
