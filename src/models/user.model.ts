import {Table, Column, Model, DataType, BelongsTo, HasMany} from 'sequelize-typescript'
import Transaction from './transaction.model'

@Table({
    tableName: 'users',
    timestamps: true
})
class User extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true
    })
    id!: number

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    email!: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password!: string

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    points?: number

    @HasMany(() => Transaction, 'senderId')
    transactions!: Transaction[]
}

export default User