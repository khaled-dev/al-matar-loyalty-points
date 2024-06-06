import mongoose, {Document, Schema} from 'mongoose';

export enum TransactionStatus {
    PENDING = "pending",
    REJECTED = "rejected",
    CONFIRMED = "confirmed",
}

export interface ITransaction {
    senderEmail: string,
    receiverEmail: string,
    points: number,
    status: TransactionStatus,
}

const TransactionSchema : Schema = new Schema(
    {
        senderEmail: { type: String, required: true },
        receiverEmail: { type: String, required: true },
        points: { type: Number, required: true },
        status: { type: String, default: TransactionStatus.PENDING }
    }, { timestamps: true }
);


export interface TransactionModel extends ITransaction, Document {
    createdAt: Date,
    updatedAt: Date,
}

export default mongoose.model<TransactionModel>('Transaction', TransactionSchema)