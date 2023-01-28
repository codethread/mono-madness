import path from "path";
import fs from "fs-extra";
import { rimraf } from "rimraf";
import { thousand } from "./helpers";
import * as WKS from "./workspaces";
import { createWorkspaceFiles } from "./steps/createWorkspaceFiles";
import { generateWorkspaceFiles } from "./steps/generateWorkspaceFiles";
import { createRootFiles } from "./steps/createRootFiles";
import { runBootstrapCommands } from "./steps/runBootstrapCommands";
import type { Config } from "./shared";


// i think this is so big that i likely need to give lsp more memory
// can investigate more on vscode
// when using compositie with builds, it saves the editor parsing more than one
// project till i open it, which is nice
const config: Config = {
  projectLocation: "~/dev/gen/large-return",
  functionCount: thousand(1),
  exportCount: 10,
  fileCount: 100,
  composite: false,
    useInternal: true,
  returnTypes: true,
  functionSize: "large",
 workspaces : WKS.complexWorkspaces,
 workspaceDependencies : WKS.complexWorkspaceDependencies,
};

(async () => {
  console.log("running");
  const { projectLocation, composite, workspaces } = config;
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
    await runBootstrapCommands(target)
})();




