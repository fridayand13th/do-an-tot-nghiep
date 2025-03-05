import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { BaseModel } from "./base.model";
import { Users } from "./users.model";

@Table({
  tableName: "tasks",
  underscored: true,
})
export class Tasks extends BaseModel<Tasks> {
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  userId: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endDate: Date;

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  toDoDay: number;

  @BelongsTo(() => Users)
  user: Users;
}
