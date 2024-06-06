import {NextFunction, Request, Response} from "express";
import Logging from "../config/logging";
import response from "../http/response";
import jwt from 'jsonwebtoken';

export const auth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        let token : any = res.getHeader('access-token')

        if (! token) {
            return response.error(res, {}, 'Unauthorized', 401)
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET!)
        } catch(err) {
            return response.error(res, { message: err.message }, 'Unauthorized', 401)
        }

        Logging.info(`access-token: ${token}`)

        next();
    };
};

