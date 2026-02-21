import { User, UserId } from "./src/domain/auth/lib.ts";

const user = User({ id: UserId(crypto.randomUUID()) });

console.log(user);
