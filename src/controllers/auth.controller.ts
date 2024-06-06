import { Request, Response } from 'express';
import User, {UserModel} from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


interface IRegisterRequest extends Request {
    body: {
        name: string;
        email: string;
        password: string;
    };
}

interface ILoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

const register = async (req: IRegisterRequest, res: Response) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user: UserModel = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        points: 500
    });

    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_EXPIRE });

    res.status(201).send({ message: 'Registration successful', token });
};

const login = async (req: ILoginRequest, res: Response) => {

    const user : UserModel = await User.findOne({ email: req.body.email });

    if (! user) return res.status(404).send({ message: 'User not found' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (! validPassword) return res.status(401).send({ message: 'Invalid password' });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_EXPIRE });

    res.send({ message: 'Logged in successfully', token });
};

export default { register, login };
