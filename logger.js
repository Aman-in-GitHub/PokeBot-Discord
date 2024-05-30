import pino from 'pino';

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: {
        destination: process.stdout.fd
      }
    }
  ]
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    timestamp: () => `,"timestamp":"${new Date()}"`,
    redact: {
      paths: ['email', 'password', 'token', 'address'],
      remove: true
    }
  },
  transport
);

export default logger;
