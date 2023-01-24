import path from "path";
import fs from "fs-extra";
import { genPackageJson, genRootPackageJson } from "./pj";
import { generateRootTsconfig, generateTsconfig, generateTsFiles } from "./tsc";
import { yarnrc } from "./yarn";
import { rimraf } from "rimraf";
import { asyncExec, generateNames, thousand } from "./helpers";

const config = {
  projectLocation: "~/dev/projects/generated",
  functionCount: thousand(50),
  fileCount: 2000,
  composite: false,
};

(async () => {
  const { functionCount, projectLocation, fileCount, composite } = config;
  const target = projectLocation.replace("~", process.env["HOME"] ?? "");
  console.log("running");
  console.log("removing old files");
  await rimraf(target);

  // generate workspaces
  const workspaces = ["a", "b", "c"] as const;
  type WorkspaceKey = (typeof workspaces)[number];
  type Deps = Partial<Record<WorkspaceKey, string[]>>;
  const workspaceDependencies: Deps = {
    a: ["b", "c"],
    b: ["c"],
  };

  const workspaceFiles = workspaces.map((workspace) => {
    const peers = workspaceDependencies[workspace] ?? [];
    const packageJson = genPackageJson({
      name: workspace,
      workspacesDependencies: peers,
      build: true,
    });
    const tsconfig = generateTsconfig({ include: ["src"], peers: peers });

    const names = generateNames(`${workspace}_`, functionCount);
    const tsFiles = generateTsFiles(names, fileCount);
    return {
      name: workspace,
      packageJson,
      tsconfig,
      tsFiles,
    };
  });

  // create directories for all workspaces
  await Promise.all(
    workspaces.map((workspace) =>
      fs.ensureDir(path.join(target, "packages", workspace, "src"))
    )
  );

  // generate root files for project
  await Promise.all([
    fs.writeJson(
      path.join(target, "package.json"),
      genRootPackageJson({ workspaces })
    ),
    fs.writeJson(
      path.join(target, "tsconfig.json"),
      generateRootTsconfig({ composite })
    ),
    fs.writeFile(path.join(target, ".gitignore"), "node_modules\ndist"),
    fs.writeFile(path.join(target, ".yarnrc.yml"), yarnrc),
  ]);

  await Promise.all(
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

  const commands = [
    "git init",
    "yarn",
    "yarn plugin import workspace-tools",
    "echo generated to: $PWD",
  ];

  for await (const command of commands) {
    const { stdout, stderr } = await asyncExec(command, target);
    console.log(stdout, stderr);
  }
})();
