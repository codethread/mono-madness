import path from "path";
import fs from "fs-extra";
import { genRootPackageJson } from "../builders/pj";
import {
    generateProjectTsconfig,
    generateRootTsconfig
} from "../builders/typescript/tsc";
import { yarnrc } from "../builders/yarn";

// ======================================================================
// HELPERS
// ======================================================================
export async function createRootFiles({
    workspaces, composite, target,
}: {
    target: string;
    workspaces: readonly string[];
    composite: boolean;
}) {
    return Promise.all([
        fs.writeJson(
            path.join(target, "package.json"),
            genRootPackageJson({ workspaces, composite })
        ),
        composite
            ? fs.writeJson(
                path.join(target, "packages", "tsconfig.json"),
                generateProjectTsconfig({ peers: workspaces })
            )
            : Promise.resolve(),
        fs.writeJson(
            path.join(target, "tsconfig.json"),
            generateRootTsconfig({ composite })
        ),
        fs.writeFile(path.join(target, ".gitignore"), "node_modules\ndist"),
        fs.writeFile(path.join(target, ".yarnrc.yml"), yarnrc),
    ]);
}

