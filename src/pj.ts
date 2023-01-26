interface PJRoot {
  workspaces: readonly string[];
  composite?: boolean;
}
export const genRootPackageJson = (info: PJRoot) => ({
  name: "root",
  private: true,
  scripts: {
    ...(info.composite ? { ts: "cd packages && tsc -b" } : {}),
    build: "yarn workspaces foreach -pt run build",
    clean: "git clean -dfX && yarn",
    cleanBuild: "yarn clean && yarn build",
  },
  workspaces: info.workspaces.map((workspace) => `packages/${workspace}`),
  packageManager: "yarn@3.3.1",
  volta: {
    node: "18.13.0",
    yarn: "3.3.1",
  },
  devDependencies: {
    typescript: "^4.9.4",
  },
});

interface PJ {
  name: string;
  build?: boolean;
  workspacesDependencies?: readonly string[];
  dependencies?: string[];
}
export const genPackageJson = (info: PJ) => ({
  name: info.name,
  version: "1.0.0",
  ...(info.build && { main: "dist/index.js", types: "dist/index.d.ts" }),
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
    ...(info.build && { build: "tsc" }),
  },
  dependencies: {
    typescript: "^4.9.4",
    ...Object.fromEntries(
      info.workspacesDependencies?.map((dep) => [dep, "workspace:*"]) ?? []
    ),
  },
  volta: {
    node: "18.13.0",
    yarn: "3.3.1",
  },
});
