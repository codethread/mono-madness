import path from "path";
import fs from "fs-extra";
import type { WorkspaceFiles } from "../shared";

export async function createWorkspaceFiles({
    workspaceFiles, target,
}: {
    workspaceFiles: WorkspaceFiles[];
    target: string;
}) {
    return Promise.all(
        workspaceFiles.flatMap(async (workspaceFile) => {
            const { packageJson, tsconfig, tsFiles, name } = workspaceFile;

            const tsFileWriters = tsFiles.map(async ([filename, contents]) => {
                return fs.writeFile(
                    path.join(target, "packages", name, "src", filename),
                    contents
                );
            });

            return Promise.all(
                tsFileWriters.concat([
                    fs.writeJson(
                        path.join(target, "packages", name, "package.json"),
                        packageJson
                    ),

                    fs.writeJson(
                        path.join(target, "packages", name, "tsconfig.json"),
                        tsconfig
                    ),
                ])
            );
        })
    );
}

