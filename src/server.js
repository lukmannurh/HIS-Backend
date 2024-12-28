import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import db from "./models/index.js";
import { createStarterAccounts } from "./utils/createStarterAccounts.js";

const PORT = process.env.PORT || 3000;

db.sequelize
  .sync()
  .then(async () => {
    console.log("Database synced successfully!");

    await createStarterAccounts();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
