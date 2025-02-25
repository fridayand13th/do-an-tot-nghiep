import { UserType } from 'src/enums/user.enum';

// password partern
export const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})';
export const SPEC_KEY = 'SPEC';

export const USER = {
  id: '1',
  password: 'Test@123',
  email: 'test@email.com',
  name: 'name',
  phone: '0123456789',
  userType: UserType.CLIENT,
  permissions: [],
};

export const ROLES_KEY = 'roles';
export const MAX_SIZE = 20 * 1024 * 1024;
export const NUMBER_PATTERN = '(?=.*[0-9])';

export const FEE_TYPE = {
  REQUEST: {
    CREATION: 'request_creation',
    MODIFICATION: 'request_modification',
  },
  MATCH: {
    VIEW: 'match_view',
  },
  RENEWAL: 'renewal',
};
