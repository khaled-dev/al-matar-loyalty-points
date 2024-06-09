import express from 'express'
import controller from '../controllers/auth.controller'
import {ValidateJoi} from "../middleware/Joi"
import {loginValidationSchema, registerValidationSchema} from "../middleware/validations/auth.validation.schema"

const router = express.Router()

router.post('/register', ValidateJoi(registerValidationSchema), controller.register)
router.post('/login', ValidateJoi(loginValidationSchema),  controller.login)


export = router
