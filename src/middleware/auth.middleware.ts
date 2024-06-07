import {NextFunction, Request, Response} from "express";
import Logging from "../config/logging";
import response from "../http/response";
import jwt from 'jsonwebtoken';

export const authMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        let authHeader : any = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (! token) {
            return response.error(res, {}, 'Unauthorized', 401)
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET!)
        } catch(err) {
            return response.error(res, { message: err.message }, 'Unauthorized', 401)
        }

        if (process.env.NODE_ENV !== 'test') {
            Logging.info(`access-token: ${token}`)
        }

        next();
    };
};

