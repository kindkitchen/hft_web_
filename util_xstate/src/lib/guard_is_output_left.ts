import { Either } from "effect";
import { AnyEventObject } from "xstate";
import { im_sure } from "./im_sure.ts";

/**
 * #### Check that `event.output` is typeof `Either.Either.Left`
 * The place, where this `guard` can be simply mentioned,
 * makes assumption,
 * that the `event` has `output`
 * _(because it is from actor `onDone`)_
 * with `effect'`s `Either` type.
 */
export const is_output_left = ({ event }: { event: AnyEventObject }) =>
    Either.isRight(im_sure.event_with_either_output(event).output);
