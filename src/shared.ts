export type Key<T> = T extends readonly (infer U)[] ? U : never;

export type Deps<A extends string> = Partial<Record<A, string[]>>;

export interface WorkspaceFiles {
  name: string;
  packageJson: any;
  tsconfig: any;
  tsFiles: [string, string][];
}

export type Workspace = readonly string[]
export type WorkspaceDeps = Record<string, string[]>

export interface Config {
  projectLocation: string,
  functionCount: number
  exportCount: number
  fileCount: number
  composite: boolean,
  returnTypes: boolean,
    useInternal: boolean,
  functionSize: 'small' | 'medium' | 'large'
    workspaces: Workspace
    workspaceDependencies: WorkspaceDeps
}
