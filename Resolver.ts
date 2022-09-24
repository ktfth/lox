import * as Lox from './lox.ts';

const FunctionType = {
  NONE: 0,
  FUNCTION: 1,
  INITIALIZER: 2,
  METHOD: 3,
};

const ClassType = {
  NONE: 0,
  CLASS: 1,
  SUBCLASS: 2,
};

export default class Resolver {
  interpreter: any;
  scopes: any;
  currentFunction: any;
  currentClass: any;

  constructor(interpreter: any) {
    this.interpreter = interpreter;

    this.scopes = [];
    this.currentFunction = FunctionType.NONE;
    this.currentClass = ClassType.NONE;
  }

  visitBlockStmt(stmt: any) {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
    return null;
  }

  visitClassStmt(stmt: any) {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (stmt.superclass !== null &&
        stmt.name.lexeme === stmt.superclass.name.lexeme) {
      Lox.error(stmt.superclass.name,
        'A class can\'t inherit from itself.');
    }

    if (stmt.superclass !== null) {
      this.currentClass = ClassType.SUBCLASS;
      this.beginScope();
      this.scopes[this.scopes.length - 1].set('super', true);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1].set('this', true);

    if (stmt.methods !== undefined) {
      for (let method of stmt.methods) {
        let declaration = FunctionType.METHOD;
        if (method.name.lexeme === 'init') {
          declaration = FunctionType.INITIALIZER;
        }

        this.resolveFn(method, declaration);
      }
    }

    this.endScope();

    if (stmt.superclass !== null) this.endScope();

    this.currentClass = enclosingClass;

    return null;
  }

  visitExpressionStmt(stmt: any) {
    this.resolve(stmt.expression);
    return null;
  }

  visitFnStmt(stmt: any) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFn(stmt, FunctionType.FUNCTION);
    return null;
  }

  visitIfStmt(stmt: any) {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
    return null;
  }

  visitPrintStmt(stmt: any) {
    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }

    return null;
  }

  visitReturnStmt(stmt: any) {
    if (stmt.value !== null) {
      if (this.currentFunction === FunctionType.INITIALIZER) {
        Lox.error(stmt.keyword,
          'Can\'t return a value from an initializer.');
      }
      this.resolve(stmt.value);
    }

    return null;
  }

  visitVarStmt(stmt: any) {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  visitWhileStmt(stmt: any) {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
    return null;
  }

  visitAssignExpr(expr: any) {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
    return null;
  }

  visitBinaryExpr(expr: any) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  visitCallExpr(expr: any) {
    this.resolveExpr(expr.callee);

    for (let argument of expr.args) {
      this.resolveExpr(argument);
    }

    return null;
  }

  visitGetExpr(expr: any) {
    this.resolve(expr.object);
    return null;
  }

  visitGroupingExpr(expr: any) {
    this.resolveExpr(expr.expression);
    return null;
  }

  visitLiteralExpr(expr: any) {
    return null;
  }

  visitLogicalExpr(expr: any) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  visitSetExpr(expr: any) {
    this.resolve(expr.value);
    this.resolve(expr.object);
    return null;
  }

  visitSuperExpr(expr: any) {
    if (this.currentClass === ClassType.NONE) {
      Lox.error(expr.keyword,
        'Can\'t use \'super\' outside of a class.');
    } else if (this.currentClass !== ClassType.SUBCLASS) {
      Lox.error(expr.keyword,
        'Can\'t use \'super\' in a class with no superclass.');
    }


    this.resolveLocal(expr, expr.keyword);
    return null;
  }

  visitThisExpr(expr: any) {
    if (this.currentClass === ClassType.NONE) {
      Lox.error(expr.keyword,
        'Can\'t use \'this\' outside of a class.');
    }

    this.resolveLocal(expr, expr.keyword);
    return null;
  }

  visitUnaryExpr(expr: any) {
    this.resolveExpr(expr.right);
    return null;
  }

  visitVariableExpr(expr: any) {
    if (this.scopes.length > 0 &&
        this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false) {
      Lox.error(expr.name,
        'Can\'t read local variable in its own initializer.');
    }

    this.resolveLocal(expr, expr.name);
    return null;
  }

  resolve(statements: any) {
    if (statements !== undefined &&
        statements.constructor.toString().indexOf('Array') > -1) {
      for (const statement of statements) {
        this.resolveStmt(statement);
      }
    } else {
      if (statements !== undefined && statements.constructor.toString().indexOf('Expr') > -1) {
        this.resolveExpr(statements);
      } else if (statements !== undefined && statements.constructor.toString().indexOf('Stmt') > -1) {
        this.resolveStmt(statements);
      }
    }
  }

  resolveFn(fn: any, type: any) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (const param of fn.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(fn.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  beginScope() {
    this.scopes.push(new Map());
  }

  endScope() {
    this.scopes.pop();
  }

  declare(name: any) {
    if (this.scopes.length === 0) return;

    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      Lox.error(name,
        'Already a variable with this name in this scope.');
    }
    scope.set(name.lexeme, false);
  }

  define(name: any) {
    if (this.scopes.length === 0) return;
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  resolveLocal(expr: any, name: any) {
    for (let i = this.scopes.length - 1; i >= 0; i -= 1) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  resolveStmt(stmt: any) {
    stmt.accept(this);
  }

  resolveExpr(expr: any) {
    expr.accept(this);
  }
}