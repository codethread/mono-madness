import path from "path";
import fs from "fs-extra";
import { genPackageJson, genRootPackageJson } from "./pj";
import {
  generateProjectTsconfig,
  generateRootTsconfig,
  generateTsconfig,
  generateTsFiles,
} from "./tsc";
import { yarnrc } from "./yarn";
import { rimraf } from "rimraf";
import { asyncExec, generateNames, thousand } from "./helpers";
import * as WKS from "./workspaces";

type Workspace = WKS.ComplexWorkspace;
const workspaces = WKS.complexWorkspaces;
const workspaceDependencies = WKS.complexWorkspaceDependencies;

// i think this is so big that i likely need to give lsp more memory
// can investigate more on vscode
// when using compositie with builds, it saves the editor parsing more than one
// project till i open it, which is nice
const configSoBigINeedsComp = {
  projectLocation: "~/dev/projects/gen/large",
  functionCount: thousand(50),
  exportCount: 100,
  fileCount: 1000,
  composite: true,
  returnTypes: false, // interesting, this did not seem to matter
  functionSize: "large" as const,
};

const config = {
  projectLocation: "~/dev/projects/gen/large-return",
  functionCount: thousand(50),
  exportCount: 100,
  fileCount: 1000,
  composite: true,
  returnTypes: true,
  functionSize: "large" as const,
};
type Config = typeof config;

(async () => {
  console.log("running");
  const { functionCount, projectLocation, fileCount, composite } = config;
  const target = projectLocation.replace("~", process.env["HOME"] ?? "");

  console.log("removing old files");
  await rimraf(target);

  console.log("creating directories for new project");
  await Promise.all(
    workspaces.map((workspace) =>
      fs.ensureDir(path.join(target, "packages", workspace, "src"))
    )
  );

  console.log("creating root files");
  await createRootFiles({ workspaces, composite, target });

  console.log("creating project files");
  await createWorkspaceFiles({
    workspaceFiles: workspaces.map(generateWorkspaceFiles(config)),
    target,
  });

  console.log("bootstrapping project");
  const commands = [
    "git init",
    "yarn",
    "yarn plugin import workspace-tools",
    // "yarn prettier --write --ignore-path=.gitignore .",
    "yarn workspace a add ts-node @types/node",
    "echo generated to: $PWD",
  ];

  for await (const command of commands) {
    const { stdout, stderr } = await asyncExec(command, target);
    console.log(stdout, stderr);
  }
})();

// ======================================================================
// HELPERS
// ======================================================================

async function createRootFiles({
  workspaces,
  composite,
  target,
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

async function createWorkspaceFiles({
  workspaceFiles,
  target,
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

interface WorkspaceFiles {
  name: string;
  packageJson: any;
  tsconfig: any;
  tsFiles: [string, string][];
}

function generateWorkspaceFiles({
  composite,
  exportCount,
  functionCount,
  fileCount,
  ...config
}: Config) {
  return (workspace: Workspace): WorkspaceFiles => {
    const peers = workspaceDependencies[workspace] ?? [];
    const packageJson = genPackageJson({
      name: workspace,
      workspacesDependencies: peers,
      build: composite,
    });
    const tsconfig = generateTsconfig({ include: ["src"], peers: peers });

    const names = generateNames(`${workspace}_`, functionCount);
    const tsFiles = generateTsFiles(names, fileCount, exportCount, {
      size: config.functionSize,
      returnType: config.returnTypes,
    });
    return {
      name: workspace,
      packageJson,
      tsconfig,
      tsFiles,
    };
  };
}
