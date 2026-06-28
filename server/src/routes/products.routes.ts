import { Router } from 'express';

import { getProductById, searchProducts } from '../controllers/products.controller';

export const productsRouter = Router();

productsRouter.get('/search', searchProducts);
productsRouter.get('/:id', getProductById);
