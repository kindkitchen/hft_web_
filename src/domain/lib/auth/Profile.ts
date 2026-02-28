import { Brand, Data } from "effect";

export type ProfileId =
  & Brand.Brand<"ProfileId">
  & string;
export const ProfileId = Brand.nominal<
  ProfileId
>();
export type Profile = {
  _tag: "Profile";
  id: ProfileId;
  exchange_account: ExchangeAccount;
};
export const Profile = Data.tagged<
  Profile
>("Profile");

export type ExchangeAccount = Data.TaggedEnum<{
  Binance: {};
  Kucoin: {};
}>;
export const ExchangeAccount = Data
  .taggedEnum<ExchangeAccount>();
