import {Request} from "express"
import jwt from "jsonwebtoken"
import {number, string} from "joi";

const getAuthEmail = (req: Request) : string => {
    let authHeader : any = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    let decoded = jwt.verify(token, process.env.JWT_SECRET!)

    return decoded.email
}

const getAuthId = (req: Request) : string => {
    let authHeader : any = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    let decoded = jwt.verify(token, process.env.JWT_SECRET!)

    return decoded.id
}

interface signAuth {
    id: number,
    email: string
}

const signAuth = (user: signAuth) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRE })
}

export default {getAuthEmail, getAuthId, signAuth}