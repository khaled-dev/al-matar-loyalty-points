import Joi from "joi";
import {ITransaction} from "../../models/transaction.model";

export const createValidationSchema = Joi.object<ITransaction>(
    {
        senderEmail: Joi.string().required(),
        receiverEmail: Joi.string().required(),
        // receiverEmail: Joi.string().required().custom(  (value, helpers) => {
        //     // check if exists
        //     return helpers.error('any.invalid');
        // }, 'custom validation'),
        points: Joi.number().required(),
    });