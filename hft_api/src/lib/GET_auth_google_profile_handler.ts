import { is_user_session, Session } from "../domain/auth/lib.ts";
import { MINUTE } from "@std/datetime";
import { OAuth2Client } from "google-auth-library";
import { Cookie } from "elysia/cookies";
import { Db } from "./db.ts";

export async function GET_auth_google_profile_handler(
  state_google_sign_in: Cookie<unknown>,
  session: Session,
  db: Db,
  google_oauth_client: OAuth2Client,
  GOOGLE_CLIENT_REDIRECT_URI: string,
) {
  const state = crypto.randomUUID();
  const location = google_oauth_client.generateAuthUrl({
    state,
    scope: ["email"],
    redirect_uri: GOOGLE_CLIENT_REDIRECT_URI,
    include_granted_scopes: true,
    ...(is_user_session(session.details) && {
      login_hint: session.details.auth_provider.email,
    }),
  });
  await db.save_session(session, { state });
  state_google_sign_in.set({
    value: state,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: MINUTE,
  });

  return new Response(null, {
    status: 301,
    headers: {
      location,
    },
  });
}
