import { asyncExec } from "../helpers";

export async function runBootstrapCommands(target: string) {
    const commands = [
        "git init",
        "yarn",
        "yarn plugin import workspace-tools",
        "yarn prettier --write --ignore-path=.gitignore .",
        "yarn workspace a add ts-node @types/node",
        "git add . && git commit -m'init'",
        "echo generated to: $PWD",
        "code ."
    ];

    for await (const command of commands) {
        const { stdout, stderr } = await asyncExec(command, target);
        console.log(stdout, stderr);
    }
}

