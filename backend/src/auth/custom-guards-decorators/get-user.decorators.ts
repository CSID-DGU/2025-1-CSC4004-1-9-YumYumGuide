import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "src/user/schemas/user.schema";

export const Authorization = createParamDecorator((data, ctx: ExecutionContext): User => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});