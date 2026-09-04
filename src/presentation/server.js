import fastify from 'fastify';

export function createServer({ webhookController, logger = true }) {
  const app = fastify({ logger });

  app.post('/webhook', webhookController.handle.bind(webhookController));

  return app;
}
