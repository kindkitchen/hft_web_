import text from "./help.txt" with { type: "text" };
import * as path from "@std/path";
import * as fs from "@std/fs";
import { join } from "node:path";
import { parseArgs } from "@std/cli";
import { TomlConfig } from "./toml_config_type.ts";
import { process_machine_file } from "./process_machine_file.ts";

/**
 * - help
 * - init
 * - generate
 */
export async function cli(cli_arguments: string[]) {
    const DEFAULTS = {
        config: ".config/x_plopper.toml",
    };

    const input = parseArgs(cli_arguments, {
        "--": true,
        string: ["config"],
        boolean: ["init", "help"],
    });
    const {
        ["--"]: _args_after_dash_dash,
        ["_"]: args,
        help,
        config = DEFAULTS.config,
        init,
    } = input;

    const generate = args.includes("generate");

    /**
     * Handle `help` command
     */
    if (help || (!generate && !init)) {
        console.log(
            `%c${text.replace("{{ default_config }}", DEFAULTS.config)}`,
            `
background-color: lightyellow;
color: darkblue;
`,
        );

        return;
    }

    const cwd = Deno.cwd();

    /**
     * Declare path to config
     * (custom with fallback to default)
     */
    const path_to_config = path.join(cwd, config);
    console.log(path_to_config);
    console.log(cwd);
    console.log(import.meta.dirname);

    /// No any ambiguous commands
    if (init && generate) {
        console.error(
            "Please choose 1 command - init or generate, but not both!",
        );
        return Deno.exit(1);
    }

    const cp_default_config_to_config_path = async () => {
        const config_folder = path.dirname(path_to_config);
        await fs.ensureDir(config_folder);
        await Deno
            .copyFile(
                path.join(import.meta.dirname!, "default_config.toml"),
                path_to_config,
            );
    };

    /**
     * Handle `init` command
     */
    if (init) {
        /// Check is config already exists
        if (await fs.exists(path_to_config, { isFile: true })) {
            const override = confirm(
                `The "${path_to_config}" is already exists! Are you sure you want to override it? (y/N)`,
            );

            if (!override) return Deno.exit(1);
        }

        await cp_default_config_to_config_path();
    } /**
     * Command `generate`
     *
     * 0. Init, if not config found
     * 1. Read config
     * 2. Scan project to detect all _machine_ files
     * 3. Process each file
     *     - by name
     *     - by glob (skipping already processed by name)
     */
    else if (generate) {
        const { parse } = await import("@std/toml");

        if (!await fs.exists(path_to_config)) {
            await cp_default_config_to_config_path();
        }

        /// 1.
        const configStr = await Deno.readTextFile(path_to_config);
        const config = parse(configStr) as TomlConfig;
        console.log(config);

        /// presave names to skip during glob scan
        const machine_paths_from_names = [] as string[];

        /// 3. (by name)
        for (
            /// by the way - technically machine's name is relative path to it
            const machine_name of config.naming.machine.names
        ) {
            const is_exists = await fs.exists(join(cwd, machine_name));
            if (!is_exists) {
                console.warn(
                    `The declared in config machine does not exists!\n${machine_name}`,
                );
                continue;
            }
            const path_from_name = join(cwd, machine_name);

            machine_paths_from_names.push(path_from_name);

            await process_machine_file(config, {
                path_to_machine: path_from_name,
                path_to_folder_with_machine: path.dirname(path_from_name),
            });
        }

        /// 2. (by glob)
        for (const glob of config.naming.machine.globs) {
            for await (
                const machine of fs.expandGlob(glob, {
                    root: cwd,
                    exclude: config.naming.machine.globs_to_exclude,
                })
            ) {
                if (machine_paths_from_names.includes(machine.path)) {
                    console.warn(
                        `Skip machine, detected by glob, because it is already match by-name locator (${machine.path})`,
                    );
                    continue;
                }

                await process_machine_file(config, {
                    path_to_machine: machine.path,
                    path_to_folder_with_machine: path.dirname(machine.path),
                });

                console.log("processing", machine.path);
            }
        }
    }
}

if (import.meta.main) {
    await cli(Deno.args);
}
