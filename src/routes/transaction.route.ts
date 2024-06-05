import express from 'express';
import controller from '../controllers/transaction.controller';
import {Schema, ValidateJoi} from "../middleware/Joi";
// import { Schemas, ValidateJoi } from '../middleware/Joi';

const router = express.Router();

router.post('/create', ValidateJoi(Schema.transaction.create),  controller.createTransfer);
router.post('/create',  controller.createTransfer);


export = router;
