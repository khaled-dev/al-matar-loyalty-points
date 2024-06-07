import {Request} from "express";
import jwt from "jsonwebtoken";

const getAuthEmail = (req: Request) : string => {
    let authHeader : any = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    let decoded = jwt.verify(token, process.env.JWT_SECRET!)

    return decoded.email
}

export default {getAuthEmail}