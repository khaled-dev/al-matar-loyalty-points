import User from "../models/user.model";

const points = (user: User) => {
    return {
        Points: user.points,
    }
}

export default {points}