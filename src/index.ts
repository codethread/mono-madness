import path from "path";
import fs from "fs-extra";
import { genPackageJson, genRootPackageJson } from "./pj";
import { generateTsconfig, generateTsFiles, tsFileContents } from "./tsc";
import { exec } from "child_process";
import { yarnrc } from "./yarn";
import { rimraf } from "rimraf";

const size = 10000;
function replaceAllNonLetters(str: string) {
  return str.replace(/[^a-zA-Z]/g, "");
}
const generateNames = (prefix: string, size: number): string[] => {
  const names = [];
  for (let i = 0; i < size; i++) {
    names.push(
      prefix + replaceAllNonLetters(Math.random().toString(36).substring(2, 25))
    );
  }
  return names;
};

const t = "~/dev/projects/generated";
const target = t.replace("~", process.env["HOME"] ?? "");

(async () => {
  console.log("running");
  console.log("removing old files");
  await rimraf(target);

  // generate workspaces
  const workspaces = ["a", "b", "c"] as const;
  type WorkspaceKey = (typeof workspaces)[number];
  const workspaceDependencies: Partial<Record<WorkspaceKey, string[]>> = {
    a: ["b", "c"],
    b: ["c"],
  };

  const workspaceFiles = workspaces.map((workspace) => {
    const packageJson = genPackageJson({
      name: workspace,
      workspacesDependencies: workspaceDependencies[workspace] ?? [],
      build: true,
    });
    const tsconfig = generateTsconfig(["src"]);

    const names = generateNames(`${workspace}_`, size);
    const tsFiles = generateTsFiles(names, 20);
    // const tsFiles: [string, string][] = [
    //   ["index.ts", tsFileContents(generateNames(`${workspace}_`, size))],
    // ];
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
    fs.writeJson(path.join(target, "tsconfig.json"), {}),
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
    // "code .",
  ];

  asyncForEach(
    commands.map(
      (command) => () =>
        asyncExec(command, target).then(({ stdout, stderr }) => {
          console.log(stdout, stderr);
        })
    )
  );
})();

async function asyncForEach(
  promises: Array<() => Promise<any>>
): Promise<void> {
  for (let i = 0; i < promises.length; i++) {
    await promises[i]!();
  }
}
function asyncExec(
  command: string,
  target: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: target }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}
