import Joi from "joi";
import {ITransaction} from "../../models/transaction.model";
import User, {UserModel} from "../../models/user.model";

export const createTransactionValidationSchema = Joi.object<ITransaction>(
    {
        senderEmail: Joi.string().required().email().external(async (value, helpers) => {
            let user : UserModel = await User.findOne({ email: value }).exec()

            if (! user) {
                return helpers.message( {external: '{#label} does not exist' })
            }

            return true
        }),
        receiverEmail: Joi.string().required().email() .external(async (value, helpers) => {
            let user : UserModel = await User.findOne({ email: value }).exec()

            if (! user) {
                return helpers.message( {external: '{#label} does not exist' })
            }

            return true
        }),
        points: Joi.number().positive().required(),
    });