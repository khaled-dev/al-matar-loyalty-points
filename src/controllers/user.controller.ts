import {Request, Response} from 'express'
import response from "../http/response"
import userView from "../views/user.view"
import User from "../models/user.model"
import authService from "../services/auth.service"

/**
 * Get user's points.
 *
 * @param req
 * @param res
 */
const getPoints = async (req: Request, res: Response) => {
    const user : User = await User.findOne({ where: { id: authService.getAuthId(req) } })

    response.success(res, userView.points(user), 'User Points')
}


export default { getPoints}
