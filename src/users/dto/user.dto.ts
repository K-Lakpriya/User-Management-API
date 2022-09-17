import { User } from '../schemas/user.schema';

export class UserDto {
  role: string;
  email: string;
  name: string;
  department: string;

  constructor(user: User) {
    this.name = user.name;
    this.email = user.email;
    this.role =
      user.role === 'agent'
        ? 'Agent'
        : user.role === 'manager'
        ? 'Manager'
        : 'Team Lead';
    this.department =
      user.department === 'hr'
        ? 'HR'
        : user.department === 'finance'
        ? 'Finance'
        : 'Billing';
  }
}
