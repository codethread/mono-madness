export const generateTsconfig = (include: string[]) => {
  return {
    compilerOptions: {
      target: "es5",
      module: "commonjs",
      strict: true,
      esModuleInterop: true,
      outDir: "dist",
      rootDir: "src",
      declaration: true,
    },
    include,
  };
};

export function funcTemplate(name: string): string {
  return `
export function ${name}() {
  return 1 + 2
}
`;
}

export const tsFileContents = (names: string[]) =>
  names.map((name) => funcTemplate(name)).join("\n");
