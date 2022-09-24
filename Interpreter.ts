import * as Lox from "./lox.ts";
import LoxClass from "./LoxClass.ts";
import { TokenType } from "./TokenType.ts";
import Environment from "./Environment.ts";
import LoxCallable from "./LoxCallable.ts";
import LoxFunction from "./LoxFunction.ts";
import RuntimeError from "./RuntimeError.ts";
import Return from "./Return.ts";

class Clock extends LoxCallable {
  constructor(callee?: any) {
    super(callee);
  }

  arity() {
    return 0;
  }

  call(_interpreter: any, _args: any) {
    return (new Date()).getMilliseconds() / 1000.0;
  }
}

class Reverse extends LoxCallable {
  constructor(callee?: any) {
    super(callee);
  }

  arity() {
    return 1;
  }

  call(_interpreter: any, args: any) {
    return args[0].split("").reverse().join("");
  }
}

export default class Interpreter {
  globals: Environment;
  environment: Environment;
  locals: Map<any, any>;

  constructor() {
    this.globals = new Environment();
    this.environment = this.globals;
    this.locals = new Map();

    this.globals.define("clock", new Clock());
    this.globals.define("reverse", new Reverse());

  }

  interpret(statements: any) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      Lox.runtimeError(error);
    }
  }

  visitLiteralExpr(expr: any) {
    return expr.value;
  }

  visitLogicalExpr(expr: any) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitSetExpr(expr: any) {
    const object = this.evaluate(expr.object);

    if (object.constructor.toString().indexOf("LoxInstance") === -1) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  visitSuperExpr(expr: any) {
    const distance = this.locals.get(expr);
    const superclass = this.environment.getAt(
      distance,
      "super",
    );

    const object = this.environment.getAt(
      distance - 1,
      "this",
    );

    const method = superclass.findMethod(expr.method.lexeme);

    if (method === null) {
      throw new RuntimeError(
        expr.method,
        `Undefined property \'${expr.method.lexeme}\'.`,
      );
    }

    return method.bind(object);
  }

  visitThisExpr(expr: any) {
    return this.environment.get(expr.keyword);
  }

  visitUnaryExpr(expr: any) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.left) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    return null;
  }

  visitVariableExpr(expr: any) {
    // return this.lookUpVariable(expr.name, expr);
    return this.environment.get(expr.name);
  }

  lookUpVariable(name: any, expr: any) {
    const distance = this.locals.get(expr);
    if (distance !== null) {
      return this.environment.getAt(distance, name);
    } else {
      return this.globals.get(name);
    }
  }

  checkNumberOperand(operator: any, operand: any) {
    if (operand.constructor.toString().indexOf("Number") > -1) return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  checkNumberOperands(operator: any, left: any, right: any) {
    if (
      left !== null && left.constructor.toString().indexOf("Number") > -1 &&
      right !== null && right.constructor.toString().indexOf("Number") > -1
    ) return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  isTruthy(object: any) {
    if (object === null) return false;
    if (object.constructor.toString().indexOf("Boolean") > -1) return object;
    return true;
  }

  isEqual(a: any, b: any) {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return a === b;
  }

  stringify(object: any) {
    if (object === null || object === undefined) return "nil";

    if (
      object !== undefined &&
      object.constructor.toString().indexOf("Number") > -1
    ) {
      let text = object.toString();
      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    if (
      object !== undefined &&
      object.constructor.toString().indexOf("Object") > -1
    ) {
      return JSON.stringify(object);
    }

    return object.toString();
  }

  visitGroupingExpr(expr: any) {
    return this.evaluate(expr.expression);
  }

  evaluate(expr: any) {
    return expr.accept(this);
  }

  execute(stmt: any) {
    stmt.accept(this);
  }

  resolve(expr: any, depth: any) {
    this.locals.set(expr, depth);
  }

  repl(stmt: any) {
    try {
      this.execute(stmt);
    } catch (error) {
      Lox.runtimeError(error);
    } finally {
      if (stmt === null || stmt.expression === undefined) return;
      const value = this.evaluate(stmt.expression);
      if (stmt.constructor.toString().indexOf("Print") === -1) {
        console.log(this.stringify(value));
      }
    }
  }

  executeBlock(statements: any, environment: any) {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitBlockStmt(stmt: any) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return null;
  }

  visitClassStmt(stmt: any) {
    let superclass = null;
    if (stmt.superclass !== null) {
      superclass = this.evaluate(stmt.superclass);
      if (superclass.constructor.toString().indexOf("LoxClass") === -1) {
        throw new RuntimeError(
          stmt.superclass.name,
          "Superclass must be a class.",
        );
      }
    }

    this.environment.define(stmt.name.lexeme, null);

    if (stmt.superclass !== null) {
      this.environment = new Environment(this.environment);
      this.environment.define("super", superclass);
    }

    const methods = new Map();
    if (stmt.methods !== undefined) {
      for (const method of stmt.methods) {
        const fn = new LoxFunction(
          method,
          this.environment,
          method.name.lexeme === "init",
        );
        methods.set(method.name.lexeme, fn);
      }
    }

    const klass = new LoxClass(stmt.name.lexeme, superclass, methods);

    if (superclass !== null) {
      this.environment = this.environment.enclosing;
    }

    this.environment.assign(stmt.name, klass);
    return null;
  }

  visitExpressionStmt(stmt: any) {
    this.evaluate(stmt.expression);
    return null;
  }

  visitFnStmt(stmt: any) {
    const fn = new LoxFunction(stmt, this.environment, false);
    this.environment.define(stmt.name.lexeme, fn);
    return null;
  }

  visitIfStmt(stmt: any) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  visitPrintStmt(stmt: any) {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  visitReturnStmt(stmt: any) {
    let value = null;
    if (stmt.value !== null) value = this.evaluate(stmt.value);

    throw new Return(value);
  }

  visitVarStmt(stmt: any) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  visitWhileStmt(stmt: any) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
    return null;
  }

  visitAssignExpr(expr: any) {
    const value = this.evaluate(expr.value);

    // const distance = this.locals.get(expr);
    // if (distance !== null) {
    //   this.environment.assignAt(distance, expr.name, value);
    // } else {
    //   this.globals.assign(expr.name, value);
    // }

    this.environment.assign(expr.name, value);

    return value;
  }

  visitBinaryExpr(expr: any) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case TokenType.PLUS:
        if (
          left !== undefined && left !== null &&
          left.constructor.toString().indexOf("Number") > -1 &&
          right !== undefined && right !== null &&
          right.constructor.toString().indexOf("Number") > -1
        ) {
          return left + right;
        }

        if (
          left !== undefined && left !== null &&
          left.constructor.toString().indexOf("String") > -1 &&
          right !== undefined && right !== null &&
          right.constructor.toString().indexOf("String") > -1
        ) {
          return left + right;
        }

        if (
          left !== undefined && left !== null &&
          left.constructor.toString().indexOf("String") > -1 &&
          right !== undefined && right !== null &&
          right.constructor.toString().indexOf("Number") > -1
        ) {
          return left + right;
        }

        if (
          left !== undefined && left !== null &&
          left.constructor.toString().indexOf("Number") > -1 &&
          right !== undefined && right !== null &&
          right.constructor.toString().indexOf("String") > -1
        ) {
          return left + right;
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be number or string.",
        );
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case TokenType.MODULO:
        this.checkNumberOperands(expr.operator, left, right);
        return left % right;
    }

    return null;
  }

  visitCallExpr(expr: any) {
    const callee = this.evaluate(expr.callee);

    const args = [];
    for (const argument of expr.args) {
      args.push(this.evaluate(argument));
    }

    let flagLoxClass = false;
    let flagFunction = false;
    let flagLoxCallable = false;

    const hasLoxClass = callee.constructor.toString().indexOf("LoxClass") > -1;
    const hasLoxCallable =
      callee.constructor.toString().indexOf("LoxCallable") > -1;
    const hasFunction = callee.constructor.toString().indexOf("Function") > -1;

    if (hasLoxClass) flagLoxClass = true;
    if (hasFunction) flagFunction = true;
    if (hasLoxCallable) flagLoxCallable = true;

    if (
      (!hasFunction && !flagLoxClass && !flagLoxCallable) ||
      (!hasLoxClass && !flagFunction && !flagLoxCallable) ||
      (!hasLoxCallable && !flagFunction && !flagLoxClass)
    ) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes.",
      );
    }

    const fn = callee;
    if (args.length !== fn.arity()) {
      throw new RuntimeError(
        expr.paren,
        "Expect " +
          fn.arity() + " arguments but got " +
          args.length + ".",
      );
    }
    return fn.call(this, args);
  }

  visitGetExpr(expr: any) {
    const object = this.evaluate(expr.object);
    if (object.constructor.toString().indexOf("LoxInstance") > -1) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, "Only instances have properties.");
  }
}
