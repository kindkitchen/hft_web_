import { Brand, Data } from "effect";

export type UserId =
  & Brand.Brand<"UserId">
  & string;
export const UserId = Brand.nominal<
  UserId
>();
export type User = {
  _tag: "User";
  id: UserId;
};
export const User = Data.tagged<User>(
  "User",
);
