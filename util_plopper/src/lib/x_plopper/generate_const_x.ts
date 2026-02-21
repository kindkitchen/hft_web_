import { GenerateConstX } from "./generate_const_x_types.ts";

export function generate_const_x(
    input: GenerateConstX.Input,
): GenerateConstX.Output {
    const {
        state,
        event,
        guard,
        action,
        actor,
        delay,
    } = input;

    const result = {
        state: Object.fromEntries(
            state.map((name) => [name, { name: name, ref: `#${name}` }]),
        ),
        event: Object.fromEntries(event.map((type) => [type, { type }])),
        guard: Object.fromEntries(guard.map((name) => [name, name])),
        action: Object.fromEntries(action.map((name) => [name, name])),
        actor: Object.fromEntries(actor.map((name) => [name, name])),
        delay: Object.fromEntries(delay.map((name) => [name, name])),
    };

    return result;
}
