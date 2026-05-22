import express from 'express'
import { SeedController } from '../modules/seed/seed.controller'
const router = express.Router();
const seedController = new SeedController();

router.get('/execute', seedController.executeSeed);

export default router;
