import Joi from "joi"
import User from "../../models/user.model"

export const registerValidationSchema =  Joi.object<User>({
        name: Joi.string().required().max(225),
        email: Joi.string().required().email()
            .external(async (value, helpers) => {
                let user : User = await User.findOne({where: { email: value }})

                if (user) {
                    return helpers.message( {external: '{#label} already exists' })
                }

                return true
            }),
        password: Joi.string().required().min(5).max(225),
    })

export const loginValidationSchema =  Joi.object<User>(
    {
        email: Joi.string().required().email(),
        password: Joi.string().required().min(5).max(225),
    })