import { exec } from "child_process";

function replaceAllNonLetters(str: string) {
  return str.replace(/[^a-zA-Z]/g, "");
}

export const generateNames = (prefix: string, size: number): string[] => {
  const names = [];
  for (let i = 0; i < size; i++) {
    const name =
      prefix +
      replaceAllNonLetters(Math.random().toString(36).substring(2, 25));
    names.push(pad(name, 10));
  }
  return names;
};

export function asyncExec(
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

export function thousand(n: number): number {
  return n * 1000;
}

// pad a string with random letters to a certain length
function pad(str: string, length: number): string {
  const diff = length - str.length;
  if (diff <= 0) {
    return str;
  }
  return str + genRandomLetters(diff);
}

function genRandomLetters(length: number): string {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += genRandomLetter();
  }
  return str;
}

function genRandomLetter(): string {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26));
}
