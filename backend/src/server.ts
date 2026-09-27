import dotenv from 'dotenv';
dotenv.config();

import { app, logger } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
