import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { Effect } from "effect";
import { Db } from "./db.ts";
import { attach_session } from "./attach_session.ts";
import { OAuth2Client } from "google-auth-library";
import { GET_auth_google_profile_handler } from "./GET_auth_google_profile_handler.ts";
import { GET_auth_google_callback_profile } from "./GET_auth_google_callback_profile.ts";

const init = Effect.gen(function* () {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_REDIRECT_URI,
  } = Deno.env.toObject();
  if (
    typeof GOOGLE_CLIENT_ID !== "string" ||
    typeof GOOGLE_CLIENT_SECRET !== "string" ||
    typeof GOOGLE_CLIENT_REDIRECT_URI !== "string"
  ) {
    throw "Missing environment variables!";
  }

  const google_oauth_client = new OAuth2Client({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uris: [GOOGLE_CLIENT_REDIRECT_URI],
  });
  const db = yield* Db;
  const elysia = new Elysia({ prefix: "/api" })
    .use(cors())
    .derive(async ({ cookie: { session_id } }) =>
      attach_session(session_id, db)
    )
    .get("/auth/whoami", ({ session }) => session)
    .get("/auth/google-profile", async (
      {
        cookie: {
          state_google_sign_in,
        },
        session,
      },
    ) =>
      GET_auth_google_profile_handler(
        state_google_sign_in,
        session,
        db,
        google_oauth_client,
        GOOGLE_CLIENT_REDIRECT_URI,
      ))
    .get("/auth/google-callback/profile", async ({
      cookie: {
        state_google_sign_in,
      },
      query,
    }) =>
      GET_auth_google_callback_profile(
        query,
        state_google_sign_in,
        db,
        google_oauth_client,
      ));

  return elysia;
});

export const api = {
  init,
  Db,
};
