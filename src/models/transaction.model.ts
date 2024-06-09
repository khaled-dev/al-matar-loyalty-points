import {Table, Column, Model, BelongsTo, DataType} from 'sequelize-typescript'
import User from "./user.model"

@Table({
    tableName: 'transactions',
    timestamps: true
})
class Transaction extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true
    })
    id!: number

    @BelongsTo(() => User, 'senderId')
    sender!: User

    @BelongsTo(() => User, 'receiverId')
    receiver!: User

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    points!: number

    @Column
    status?: TransactionStatus
}

export enum TransactionStatus {
    PENDING = "pending",
    REJECTED = "rejected",
    CONFIRMED = "confirmed"
}

export default Transaction
