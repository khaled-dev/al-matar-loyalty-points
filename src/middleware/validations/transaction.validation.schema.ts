import Joi from "joi";
import Transaction, {ITransaction, ITransactionUpdate, TransactionModel} from "../../models/transaction.model";
import User, {UserModel} from "../../models/user.model";
import {isValidObjectId} from "mongoose";

export const createTransactionValidationSchema = Joi.object<ITransaction>(
    {
        senderEmail: Joi.string().required().email().external(async (value, helpers) => {
            let user : UserModel = await User.findOne({ email: value }).exec()

            if (! user) {
                return helpers.message( {external: '{#label} does not exist' })
            }

            return true
        }),
        receiverEmail: Joi.string().required().email().external(async (value, helpers) => {
            let user : UserModel = await User.findOne({ email: value }).exec()

            if (! user) {
                return helpers.message( {external: '{#label} does not exist' })
            }

            return true
        }),
        points: Joi.number().positive().required(),
    });

export const updateValidationSchema =  Joi.object<ITransactionUpdate>(
    {
        transactionId: Joi.string().required().hex().external(async (value, helpers) => {
            if (isValidObjectId(value)) {
                if (await Transaction.findById({ _id: value }).exec()) {
                    return true
                }
            }

            return helpers.message( {external: '{#label} is not exist' })
        }),
    });