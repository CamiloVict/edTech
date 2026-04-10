import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type ClerkRequestUser = {
  clerkUserId: string;
};

export const CurrentClerkUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkRequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.clerkUser as ClerkRequestUser;
  },
);
