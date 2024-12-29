import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import db from "./models/index.js";
import { createStarterAccounts } from "./utils/createStarterAccounts.js";
import logger from "./middlewares/loggingMiddleware.js";

const PORT = process.env.PORT || 3000;

db.sequelize
  .sync()
  .then(async () => {
    logger.info("Database berhasil disinkronisasi!");

    await createStarterAccounts();

    app.listen(PORT, () => {
      logger.info(`Server berjalan di port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Error sinkronisasi database:", err);
  });
