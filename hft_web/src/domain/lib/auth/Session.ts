import { Brand, Data } from "effect";
import type { ProfileId } from "./Profile.ts";
import type { UserId } from "./User.ts";

export type AuthProvider = Data.TaggedEnum<{
  Google: {
    email: string;
    sub: string;
  };
}>;
export const AuthProvider = Data
  .taggedEnum<AuthProvider>();
export type SessionDetails = Data.TaggedEnum<{
  Guest: {};
  User: {
    user_id: UserId;
    auth_provider: AuthProvider;
    profile_id:
      | ProfileId
      | null;
  };
}>;
export const SessionDetails = Data
  .taggedEnum<SessionDetails>();
export type SessionId =
  & Brand.Brand<"SessionId">
  & string;
export const SessionId = Brand.nominal<
  SessionId
>();
export type Session = {
  _tag: "Session";
  id: SessionId;
  details: SessionDetails;
};
export const Session = Data.tagged<
  Session
>("Session");

export const is_user_session = SessionDetails.$is("User");
