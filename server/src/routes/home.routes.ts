import { Router } from 'express';

import { getHomeCollections } from '../controllers/home.controller';

export const homeRouter = Router();

homeRouter.get('/collections', getHomeCollections);
