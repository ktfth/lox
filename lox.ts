import Interpreter from "./Interpreter.ts";
import Scanner from "./Scanner.ts";
import Parser from "./Parser.ts";
import { TokenType } from "./TokenType.ts";
import Resolver from "./Resolver.ts";

const {
  args,
  openSync,
  readTextFileSync,
  exit,
  isatty,
} = Deno;

const interpreter = new Interpreter();

let hadError = false;
let hadRuntimeError = false;

function runFromFile(pathName: string) {
  try {
    openSync(pathName);
    const fileContent = readTextFileSync(pathName);
    run(fileContent);
    // exit when an error occurs on interpretation process
    if (hadError) {
      exit(65);
    }
    // exit when an error occurs on runtime process
    if (hadRuntimeError) {
      exit(70);
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      console.log(`File not found: ${pathName}`);
    }
  }
}

function runFromPrompt() {
  for (;;) {
    const line = prompt("> ");
    runFromRepl(line);
  }
}

function runFromRepl(line: string | null) {
  const source = line || "";
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);

  if (hadError) {
    return;
  }

  const declaration = parser.declaration();

  interpreter.repl(declaration);
}

function run(source: string) {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse();

  if (hadError) {
    return;
  }

  const resolver = new Resolver(interpreter);
  resolver.resolve(statements);

  if (hadError) {
    return;
  }

  interpreter.interpret(statements);
}

export function report(line: any, where: any, message: any) {
  console.error(`[line ${line}] Error ${where}: ${message}`);
  hadError = true;
}

export function error(token: any, message: any) {
  if (token === 0) return;
  if (token.type === TokenType.EOF) {
    report(token.line, "at end", message);
  } else {
    report(token.line, `at \'${token.lexeme}\'`, message);
  }
}

export function runtimeError(error: any) {
  console.log(error);
  console.log(`${error.message}\n[line ${error.token.line}]`);
  hadRuntimeError = true;
}

if (isatty(Deno.stdin.rid)) {
    if (args.length > 1) {
      console.log("Usage: lox [script]");
      exit(64);
    } else if (args.length == 1) {
      runFromFile(args[0]);
    } else {
      runFromPrompt();
    }
}
