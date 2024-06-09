import express from 'express'
import controller from '../controllers/transaction.controller'
import {ValidateJoi} from "../middleware/Joi"
import {createTransactionValidationSchema, updateValidationSchema} from "../middleware/validations/transaction.validation.schema"
import {authMiddleware} from "../middleware/auth.middleware"

const router = express.Router()

router.post('/', authMiddleware(), ValidateJoi(createTransactionValidationSchema), controller.createTransaction)
router.get('/', authMiddleware(), controller.listTransactions)
router.put('/confirm', authMiddleware(), ValidateJoi(updateValidationSchema), controller.confirmTransaction)
router.put('/reject', authMiddleware(), ValidateJoi(updateValidationSchema), controller.rejectTransaction)


export = router
