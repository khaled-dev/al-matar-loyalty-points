import {Request, Response} from 'express';
import response from "../http/response";
import userView from "../views/user.view";
import User, {UserModel} from "../models/user.model";
import authService from "../services/auth.service";

/**
 * Get user's points.
 *
 * @param req
 * @param res
 */
const getPoints = async (req: Request, res: Response) => {
    const user : UserModel = await User.findOne({email: authService.getAuthEmail(req)});

    response.success(res, userView.points(user), 'User Points')
}


export default { getPoints}
