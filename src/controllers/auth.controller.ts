import { Request, Response } from 'express'
import User from '../models/user.model'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import response from "../http/response"
import Transaction, {TransactionStatus} from "../models/transaction.model"
import db from "../config/db"
import authService from "../services/auth.service";

interface IRegisterRequest extends Request {
    body: {
        name: string
        email: string
        password: string
    }
}

interface ILoginRequest extends Request {
    body: {
        email: string
        password: string
    }
}

const register = async (req: IRegisterRequest, res: Response) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    let user : User

    await db.transaction(async t => {
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }, {transaction: t})

        await Transaction.create({
            senderId: user.id,
            receiverId: user.id,
            points: 500,
            status: TransactionStatus.CONFIRMED
        }, {transaction: t})

        await User.update({ points: 500 }, { where: {id: user.id}, transaction: t})
    })

    const token = authService.signAuth({ id: user.id, email: user.email })

    response.success(res, {'access-token': token}, 'Registration successful', 201)
}

const login = async (req: ILoginRequest, res: Response) => {
    const user : User = await User.findOne({ where: { email: req.body.email } })

    if (! user) return response.error(res, {}, 'Invalid Credentials', 401)

    const validPassword = await bcrypt.compare(req.body.password, user.password)

    if (! validPassword) return response.error(res, {}, 'Invalid Credentials', 401)

    const token = authService.signAuth({ id: user.id, email: user.email })

    response.success(res, {'access-token': token}, 'Logged in successful')
}

export default { register, login }
