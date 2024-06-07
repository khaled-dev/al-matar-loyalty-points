import {UserModel} from "../models/user.model";

const points = (user: UserModel) => {
    return {
        Points: user.points,
    }
}

export default {points}