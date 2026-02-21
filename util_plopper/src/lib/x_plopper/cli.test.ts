import { cli } from "./cli.ts";
import { join } from "@std/path";
import * as fs from "@std/fs";
import { expect } from "@std/expect";

const cwd = Deno.cwd();

Deno.test(cli.name, async (t) => {
    await t.step("The generate command should work", async () => {
        const config_path = join(
            import.meta.dirname!,
            "fixture/test.config.toml",
        );
        /**
         * Simulate relative path from the root of this folder,
         * not the real cwd for this test.
         */
        const relative_config_path = config_path.replace(
            new RegExp(`^${cwd}`),
            "",
        );

        const console_output = await cli([
            "generate",
            `--config=${relative_config_path}`,
        ]);
        const is_config_exists = await fs.exists(config_path);

        console.log(console_output);

        expect(is_config_exists).toBe(true);
        /// TODO: complete test

        /// cleanup after test
        await Deno.remove(config_path);
    });
});
