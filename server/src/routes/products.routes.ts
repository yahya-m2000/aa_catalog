import { Router } from 'express';

import { getSimilarProducts } from '../controllers/home.controller';
import { getProductById, searchProducts } from '../controllers/products.controller';

export const productsRouter = Router();

productsRouter.get('/search', searchProducts);
productsRouter.get('/:id/similar', getSimilarProducts);
productsRouter.get('/:id', getProductById);
