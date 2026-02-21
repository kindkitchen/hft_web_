import { Cookie } from "elysia/cookies";
import {
  AuthProvider,
  is_user_session,
  Session,
  SessionDetails,
  UserId,
} from "../domain/auth/lib.ts";
import { Db } from "./db.ts";
import { OAuth2Client } from "google-auth-library";

const create_response = (reason?: string) =>
  new Response(null, {
    status: 301,
    headers: {
      location: reason ? `/?ok=false&reason=${reason}` : "/",
    },
  });
export async function GET_auth_google_callback_profile(
  query: Record<string, unknown>,
  state_google_sign_in: Cookie<unknown>,
  db: Db,
  google_oauth_client: OAuth2Client,
) {
  const expected_state = state_google_sign_in
    .value as
      | string
      | undefined
      | null;

  state_google_sign_in
    .remove();

  const {
    code,
    state,
    error,
  } = query;

  if (
    typeof code !==
      "string" ||
    typeof state !==
      "string"
  ) {
    if (
      typeof error ===
        "string"
    ) {
      throw error;
    }

    return create_response("FAIL: unexpected query string" as const);
  }

  if (
    state !== expected_state
  ) {
    return create_response("FAIL: states mismatch" as const);
  }

  const session = await db.get_session_by_state(state);

  if (!session) {
    return create_response(
      "FAIL: unable to find associated session with state" as const,
    );
  }

  const {
    tokens: {
      access_token,
    },
  } = await google_oauth_client
    .getToken(code);

  if (!access_token) {
    return create_response("FAIL: access_token is missing" as const);
  }

  const {
    sub,
    email,
    email_verified,
  } = await google_oauth_client
    .getTokenInfo(
      access_token,
    );

  if (!sub) {
    return create_response("FAIL: sub is missing" as const);
  }

  if (!email) {
    return create_response("FAIL: email is missing" as const);
  }

  if (!email_verified) {
    return create_response("FAIL: email is not verified" as const);
  }

  let user_id;
  let profile_id;

  if (is_user_session(session.details) === true) {
    user_id = session.details.user_id;
    profile_id = session.details.profile_id;
  } else {
    user_id = UserId(crypto.randomUUID());
    profile_id = null;
  }

  await db.save_session(
    Session({
      id: session.id,
      details: SessionDetails.User({
        auth_provider: AuthProvider.Google({ email, sub }),
        profile_id,
        user_id,
      }),
    }),
  );

  return create_response();
}
