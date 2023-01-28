interface PJRoot {
  workspaces: readonly string[];
  composite?: boolean;
}
export const genRootPackageJson = (info: PJRoot) => ({
  name: "root",
  private: true,
  scripts: {
    ...(info.composite ? { ts: "cd packages && tsc -b" } : {}),
    dev: "yarn workspace a run ts-node 'src/index.ts'",
    build: "tsc -b --verbose packages/tsconfig.json",
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
    prettier: "^2.5.1",
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
  main: "src/index.ts",
  ...(info.build && { types: "dist/index.d.ts" }),
  exports: {
    ".": {
      default: "./src/index.ts",
    },
    "./package.json": "./package.json",
  },
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
    ...(info.build && { 
            build: "tsc -b --verbose" ,
            watch: "yarn build --watch" ,
        }),
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
