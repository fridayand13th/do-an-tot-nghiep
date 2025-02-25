import { UserType } from 'src/enums/user.enum';

export interface IUser {
  id: string;
  phone: string;
  name: string;
  email: string;
  userType: UserType;
}
