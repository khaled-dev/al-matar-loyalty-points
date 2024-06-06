import Joi from "joi";
import User, {IUser, UserModel} from "../../models/user.model";

export const registerValidationSchema =  Joi.object<IUser>({
        name: Joi.string().required().max(225),
        email: Joi.string().required().email()
            .external(async (value, helpers) => {
                let user : UserModel = await User.findOne({ email: value }).exec()

                if (user) {
                    return helpers.message( {external: '{#label} already exists' });
                }
                return true;
            }),
        password: Joi.string().required().min(5).max(225),
    });

export const loginValidationSchema =  Joi.object<IUser>(
    {
        email: Joi.string().required(),
        password: Joi.string().required(),
    });