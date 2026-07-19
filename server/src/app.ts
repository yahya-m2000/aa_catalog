import cors from 'cors';
import express from 'express';

import { errorHandler } from './middleware/errorHandler';
import { currencyRouter } from './routes/currency.routes';
import { healthRouter } from './routes/health.routes';
import { homeRouter } from './routes/home.routes';
import { ordersRouter } from './routes/orders.routes';
import { paymentRouter } from './routes/payment.routes';
import { productsRouter } from './routes/products.routes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/currency', currencyRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/home', homeRouter);
  app.use('/api/payment', paymentRouter);

  app.use(errorHandler);

  return app;
}
