import { Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { BaseModel } from './base.model';

@Table({
  tableName: 'users',
  underscored: true,
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
    type: DataType.STRING(255),
    allowNull: false,
  })
  refresToken: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  refreshTokenExpireDate: Date;

}
