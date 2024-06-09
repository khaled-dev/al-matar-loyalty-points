import Joi from "joi"
import User from "../../models/user.model"
import Transaction from "../../models/transaction.model"

export const createTransactionValidationSchema = Joi.object(
    {
        receiverEmail: Joi.string().required().email().external(async (value, helpers) => {
            let user : User = await User.findOne({ where: { email: value }})

            if (! user) {
                return helpers.message( {external: '{#label} does not exist' })
            }

            return true
        }),
        points: Joi.number().positive().required(),
    })

export const updateValidationSchema =  Joi.object(
    {
        transactionId: Joi.number().required().external(async (value, helpers) => {

            if (await Transaction.findByPk(value)) {
                return true
            }

            return helpers.message( {external: '{#label} is not exist' })
        }),
    })