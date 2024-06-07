import {Request} from "express";
import jwt from "jsonwebtoken";

const getAuthEmail = (req: Request) : string => {
    const secretKey =  process.env.NODE_ENV === 'test' ? 'test' : process.env.JWT_SECRET

    let authHeader : any = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    let decoded = jwt.verify(token, secretKey!)

    return decoded.email
}

export default {getAuthEmail}