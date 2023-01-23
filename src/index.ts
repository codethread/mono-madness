import path from "path";
import fs from "fs-extra";
import { genPackageJson, genRootPackageJson } from "./pj";
import { generateTsconfig, tsFileContents } from "./tsc";
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
  await rimraf(target);
  const workspaces = ["a", "b", "c"];

  const packageA = genPackageJson({
    name: "a",
    workspacesDependencies: ["b", "c"],
  });
  const tsconfigA = generateTsconfig(["src"]);
  const tsFileA = tsFileContents(generateNames("a_", size));

  const packageB = genPackageJson({
    name: "b",
    workspacesDependencies: ["c"],
    build: true,
  });
  const tsconfigB = generateTsconfig(["src"]);
  const tsFileB = tsFileContents(generateNames("b_", size));

  const packageC = genPackageJson({ name: "c", build: true });
  const tsconfigC = generateTsconfig(["src"]);
  const tsFileC = tsFileContents(generateNames("c_", size));

  const rootPackageJson = genRootPackageJson({ workspaces });

  await Promise.all(
    workspaces.map((workspace) =>
      fs.ensureDir(path.join(target, "packages", workspace, "src"))
    )
  );

  await Promise.all([
    // write rootPackageJson to target
    fs.writeJson(path.join(target, "package.json"), rootPackageJson),
    // write rootTsconfig to target
    fs.writeJson(path.join(target, "tsconfig.json"), {}),
    // write node gitignore to target
    fs.writeFile(path.join(target, ".gitignore"), "node_modules\ndist"),
    // write yarnrc to target
    fs.writeFile(path.join(target, ".yarnrc.yml"), yarnrc),

    // write packageA to target/packages/a
    fs.writeJson(path.join(target, "packages", "a", "package.json"), packageA),
    fs.writeJson(path.join(target, "packages", "b", "package.json"), packageB),
    fs.writeJson(path.join(target, "packages", "c", "package.json"), packageC),

    // write tsconfigA to target/packages/a
    fs.writeJson(
      path.join(target, "packages", "a", "tsconfig.json"),
      tsconfigA
    ),
    fs.writeJson(
      path.join(target, "packages", "b", "tsconfig.json"),
      tsconfigB
    ),
    fs.writeJson(
      path.join(target, "packages", "c", "tsconfig.json"),
      tsconfigC
    ),

    // write tsFileA to target/packages/a/src/index.ts
    fs.writeFile(
      path.join(target, "packages", "a", "src", "index.ts"),
      tsFileA
    ),
    fs.writeFile(
      path.join(target, "packages", "b", "src", "index.ts"),
      tsFileB
    ),
    fs.writeFile(
      path.join(target, "packages", "c", "src", "index.ts"),
      tsFileC
    ),
  ]);

  const commands = [
    "git init",
    "yarn",
    "yarn plugin import workspace-tools",
    "echo $PWD",
    "code .",
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
