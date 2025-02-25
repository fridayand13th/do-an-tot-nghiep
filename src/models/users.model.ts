import { Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Transactions } from './transactions.model';
import { ApiKey } from './api-keys.model';
import { QuestionAndAnswers } from './question-and-answers.model';

@Table({
  tableName: 'users',
  underscored: true,
  paranoid: true,
})
export class Users extends BaseModel<Users> {
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  zipCode!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  address!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  contactNumber!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  avtUrl!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isAdmin!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isVerified!: boolean;

  @HasMany(() => Transactions)
  transaction: Transactions;

  @HasMany(() => ApiKey)
  apiKey!: ApiKey[];

  @HasMany(() => Transactions)
  questionAndAnswers: QuestionAndAnswers[];
}
