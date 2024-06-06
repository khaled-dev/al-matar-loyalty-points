import express from 'express';
import controller from '../controllers/transaction.controller';
import {ValidateJoi} from "../middleware/Joi";
import {transactionValidationSchema} from "../middleware/validations/transaction.validation.schema";

const router = express.Router();

router.post('/', ValidateJoi(transactionValidationSchema.transaction.create),  controller.createTransaction);
// router.post('/confirm',  controller.confirmTransaction);


export = router;
