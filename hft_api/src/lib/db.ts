import { Effect } from "effect";
import type { Session, SessionId } from "../domain/auth/lib.ts";

export class Db extends Effect.Service<Db>()("Db", {
  effect: Effect.gen(function* () {
    const session_id_VS_session = new Map<SessionId, Session>();
    const state_VS_session_id = new Map<string, SessionId>();
    return {
      save_session: async (
        session: Session,
        options?: Partial<{ state: string }>,
      ): Promise<void> => {
        session_id_VS_session.set(session.id, session);
        if (options?.state) {
          state_VS_session_id.set(options.state, session.id);
        }
      },
      get_session_by_id: async (id: SessionId): Promise<Session | null> => {
        return session_id_VS_session.get(id) || null;
      },
      get_session_by_state: async (state: string): Promise<Session | null> => {
        const id = state_VS_session_id.get(state);

        if (!id) {
          return null;
        }

        return session_id_VS_session.get(id) || null;
      },
    };
  }),
}) {}
