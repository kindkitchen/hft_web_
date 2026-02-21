import { Cookie } from "elysia/cookies";
import { Db } from "./db.ts";
import { Session, SessionDetails, SessionId } from "../domain/auth/lib.ts";
import { HOUR } from "@std/datetime";

export async function attach_session(
  session_id: Cookie<unknown>,
  db: Db,
) {
  let session;

  /// in theory if it is possible - extra handler should be created
  if (
    session_id.value &&
    typeof session_id
        .value !==
      "string"
  ) {
    throw new Error(
      "Hmm... so cookies value can be not only string?",
    );
  }

  /// <session_id> is present - check it it is actual
  if (
    typeof session_id
      .value === "string"
  ) {
    session = await db.get_session_by_id(
      SessionId(
        session_id
          .value,
      ),
    );
  }

  /// missing or not actual <session_id> - so create new
  if (!session) {
    const id = SessionId(
      crypto.randomUUID(),
    );
    session = Session({
      id,
      details: SessionDetails
        .Guest(),
    });
    await db.save_session(
      session,
    );
  }

  /// save in cookies
  session_id.set({
    value: session.id,
    httpOnly: true,
    secure: true,
    maxAge: HOUR,
  });

  /// attach
  return {
    session,
  };
}
