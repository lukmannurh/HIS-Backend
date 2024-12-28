import sequelize from "../config/db.js";
import User from "./user.js";
import Report from "./report.js";

const db = {};
db.sequelize = sequelize;
db.User = User;
db.Report = Report;

export { User, Report }; // named export
export default db; 
