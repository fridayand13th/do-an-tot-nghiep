import { Table, Column, DataType, HasMany } from "sequelize-typescript";
import { BaseModel } from "./base.model";
import { Tasks } from "./tasks.model";

@Table({
  tableName: "users",
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
    type: DataType.STRING(100),
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  hobby!: string;

  @HasMany(() => Tasks)
  tasks: Tasks[];
}
