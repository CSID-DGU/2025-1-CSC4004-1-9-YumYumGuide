import { User } from "../schemas/user.schema";

export class UserResponseDto {
  username: string;
  email: string;

  constructor(user: User) {
    this.username = user.username;
    this.email = user.email;
  }
}