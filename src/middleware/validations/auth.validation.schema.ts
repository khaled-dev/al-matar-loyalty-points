import Joi from "joi";
import {IUser} from "../../models/user.model";

export const registerValidationSchema =  Joi.object<IUser>({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
    });

export const loginValidationSchema =  Joi.object<IUser>(
    {
        email: Joi.string().required(),
        password: Joi.string().required(),
    });