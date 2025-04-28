import app from './app';
import config from './config/app.config';
import { connectDatabase, disconnectDatabase } from './config/database.config';
import logger from './utils/logger.util';

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port} in ${config.env} mode`);
      logger.info(`API is available at http://localhost:${config.port}${config.apiPrefix}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        logger.info('Server closed.');
        await disconnectDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        logger.info('Server closed.');
        await disconnectDatabase();
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Uncaught error during server startup:', error);
    process.exit(1);
  });
}

export default startServer;