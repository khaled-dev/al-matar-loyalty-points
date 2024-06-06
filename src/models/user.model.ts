import mongoose, {Document, Schema} from 'mongoose';

export interface IUser {
    name: string,
    email: string,
    password: string,
    points: number,
}

const UserSchema : Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        points: { type: Number, required: true, default: 500 },
    }, { timestamps: true }
)

export interface UserModel extends IUser, Document {}

export default mongoose.model<UserModel>('User', UserSchema)
