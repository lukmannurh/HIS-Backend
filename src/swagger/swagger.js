import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// Untuk mendapatkan __dirname dalam ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Muat file openapi.yaml
const swaggerDocument = YAML.load(path.resolve(__dirname, '../../docs/openapi.yaml'));

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
};

export default setupSwagger;
