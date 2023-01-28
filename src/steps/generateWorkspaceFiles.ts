import { genPackageJson } from "../builders/pj";
import { generateTsconfig } from "../builders/typescript/tsc";
import { generateTsFiles } from "../builders/typescript/tsFiles";
import { generateNames } from "../helpers";
import type { Config, WorkspaceFiles } from "../shared";

export function generateWorkspaceFiles( config : Config) {
    const { composite, exportCount, functionCount, fileCount, workspaceDependencies } = config
    return (workspace: string): WorkspaceFiles => {
        const peers = workspaceDependencies[workspace] ?? [];
        const packageJson = genPackageJson({
            name: workspace,
            workspacesDependencies: peers,
            build: composite,
        });
        const tsconfig = generateTsconfig({ include: ["src"], peers, composite });

        const names = generateNames(`${workspace}_`, functionCount);
        const tsFiles = generateTsFiles(names, config);
        return {
            name: workspace,
            packageJson,
            tsconfig,
            tsFiles,
        };
    };
}

