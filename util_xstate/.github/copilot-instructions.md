> [source](src/lib/guard_is_output_left.md)

#### `is_output_left`

- Check that the `event.output` is typeof `Either.Either.Left`
- **Do not check, that the event has output or it is of either type!**

---

---

---

> [source](src/lib/guard_is_output_right.md)

#### `is_output_right`

- Check that the `event.output` is typeof `Either.Either.Right`
- **Do not check, that the event has output or it is of either type!**

---

---

---

> [source](src/lib/im_sure.md)

## `im_sure.*` semantic

> As a developer I'm sure, that in this place I can do this or this.

This is mostly helpers, that tip typescript **without** actual check. Make some
simple transformation.

#### What is the goal?

Make code more readable, enforce to be in touch with some conventions to be sure
in some expectations.

#### How I can be sure?

As mentioned earlier - if you follow the convention, declared in documentation -
you can expect some behavior etc. So be careful - this may turn against you if
you ignore it.

## Context of this statements

The main part of assumptions is related to `xstate` - `effect` integration.

- Actor, resolved with `onDone` explicitly converted to effect's `Either` type.
  So instead of success - the `left` _(controlled fail)_ and `right` _(actual
  success)_ flows are represented.
- `onError` still real, unexpected _panic_ place - still be **unknown**
- All these happen in convenient way in the internal states of some _parent_
  state, which is contained _effect-full_ **actor**
- The declaration of such flow expected to be _copy-pasted_
- The _business_ state with such actor has private children:
  - _Enter_
  - _Compute_
  - _Done_
  - _Success_
  - _Exception_
  - _Error_

#### So with correct usage - **you can be sure in some types, possibility to make some transformations, etc.**

---

---

---

> [source](src/lib/logic_from_declared_effect.md)

## Transform effect, declared in context into promise logic

> This is opinionated abstraction over the original `promise_logic_from_effect`
> function.

#### I want to understand how it works!

> As already mentioned earlier - explore
> [./promise_logic_from_effect.md]([./promise_logic_from_effect.md]) first.

But the core idea is to wrap builtin `fromPromise` actor.

And also utilize context - so we make some conventions, where place actors and
that they should be of some type - and so we declare `input` that is the same as
our `context`... _what a fortune! :D_

#### Pros & Cons

This is a sacrifice of interface independency for sugar usage! The transformer
make assumption about where fn => effect should be placed. It should be placed
in { Actor: Record<name, here!> }. The reason for such design is practical
usage, when such object may simply be a context of the machine.

#### Conclusion

- The Actor[key] has shape as `() => Effect` and it should be located in
  `context.Actor["example"]`.
- So the main goal - is totally free machine from any implementations.
- Though they are still present in context.Actor - possibly it will be mapped
  here from `input`
- Both <Success> and <Error> channels from <Effect> is piped to <onDone> but
  wrapped into <Either>.
- So into <onError> will be passed <Panic>

---

---

---

> [source](src/lib/promise_logic_from_effect.md)

# About `promise_from_effect` function

```ts
import { createActor, setup, toPromise } from "xstate";
import { Effect, Either, Layer } from "effect";
import { promise_logic_from_effect } from "./promise_logic_from_effect.ts";

const machine = setup({
    actors: {
        example: promise_logic_from_effect((x: number) =>
            Effect.gen(function* () {
                if (x < 0.1) {
                    throw new Error("Boom!");
                } else if (x < 0.5) {
                    yield* Effect.fail("Oops...");
                }

                return "Ok";
            })
        ),
    },
})
    .createMachine({
        initial: "Start",
        states: {
            Finish: {
                type: "final",
            },
            Start: {
                invoke: {
                    src: "example",
                    input: {
                        args: [Math.random()],
                        layer: Layer.empty,
                    },
                    onDone: {
                        target: "Finish",
                        actions: ({ event }: any /// this will not be any in real typescript file (but here to be able run this md example with `deno test --doc`)
                        ) => {
                            if (Either.isRight(event.output)) {
                                console.info("Success:", event.output.right);
                            } else {
                                console.warn("Fail:", event.output.left);
                            }
                        },
                    },
                    onError: {
                        target: "Finish",
                        actions: ({ event }: any /// this will not be any in real typescript file (but here to be able run this md example with `deno test --doc`)
                        ) => {
                            console.error("Panic:", event.error);
                        },
                    },
                },
            },
        },
    });

await toPromise(createActor(machine).start());
```

---

---

---
