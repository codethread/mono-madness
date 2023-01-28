export const generateRootTsconfig = ({
  composite,
}: {
  composite?: boolean;
}) => {
  return {
    compilerOptions: {
      target: "ESNext",
      lib: ["ESNext"],
      module: "commonjs",
      strict: true,
      esModuleInterop: true,
      stripInternal: true,
      ...(composite
        ? { 
                    composite: true, 
      declaration: true,
      declarationMap: true,
      emitDeclarationOnly: true,
                    disableSourceOfProjectReferenceRedirect: true 
                }
        : {}),
    },
  };
};

export const generateProjectTsconfig = ({
  peers,
}: {
  peers: readonly string[];
}) => ({
  extends: "../tsconfig.json",
  files: [],
  includes: [],
  references: peers.map((peer) => ({ path: `./${peer}` })),
});

export const generateTsconfig = ({
  include,
    composite,
  peers,
}: {
  include: string[];
        composite: boolean;
  peers: string[];
}) => {
  return {
    extends: "../../tsconfig.json",
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
    },
    include: include,
    ...(composite
      ? { references: peers.map((peer) => ({ path: `../${peer}` })) }
      : {}),
  };
};

