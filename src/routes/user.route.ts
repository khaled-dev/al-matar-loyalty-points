import express from 'express';
import controller from '../controllers/user.controller';
import {authMiddleware} from "../middleware/auth.middleware";

const router = express.Router();

router.get('/points', authMiddleware(), controller.getPoints);


export = router;
