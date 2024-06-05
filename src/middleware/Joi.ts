import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ITransaction } from '../models/transaction.model';
import Logging from '../config/logging';

export const ValidateJoi = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);

            next();
        } catch (error) {

            return res.status(422).json({ error });
        }
    };
};

export const Schema = {
    transaction: {
        create: Joi.object<ITransaction>({
            senderEmail: Joi.string().required(),
            receiverEmail: Joi.string().required(),
            // receiverEmail: Joi.string().required().custom(  (value, helpers) => {
            //     // check if exists
            //     return helpers.error('any.invalid');
            // }, 'custom validation'),
            points: Joi.number().required(),
        }),
    }
};
