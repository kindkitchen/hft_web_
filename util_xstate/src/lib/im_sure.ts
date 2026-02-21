import { Either } from "effect";
import { AnyEventObject, DoneActorEvent } from "xstate";

export const im_sure = {
    event_with_either_output: (ev: AnyEventObject) =>
        ev as DoneActorEvent<Either.Either<unknown, unknown>>,
    get_output_right: <T>(ev: AnyEventObject) =>
        ((
            ev as DoneActorEvent<Either.Either<unknown, unknown>>
        ).output as { right: T }).right,
    get_output_left: <T>(ev: AnyEventObject) =>
        ((
            ev as DoneActorEvent<Either.Either<unknown, unknown>>
        ).output as { left: T }).left,
};
