export class Stmt {}

export class Block {
  statements: any;

  constructor(statements: any) {
    this.statements = statements;
  }

  accept(visitor: any) {
    return visitor.visitBlockStmt(this);
  }

}

export class Class {
  name: any;
  superclass: any;
  methods: any;

  constructor(name: any, superclass: any, methods: any) {
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  accept(visitor: any) {
    return visitor.visitClassStmt(this);
  }

}

export class Expression {
  expression: any;

  constructor(expression: any) {
    this.expression = expression;
  }

  accept(visitor: any) {
    return visitor.visitExpressionStmt(this);
  }

}

export class Fn {
  name: any;
  params: any;
  body: any;

  constructor(name: any, params: any, body: any) {
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept(visitor: any) {
    return visitor.visitFnStmt(this);
  }

}

export class If {
  condition: any;
  thenBranch: any;
  elseBranch: any;

  constructor(condition: any, thenBranch: any, elseBranch: any) {
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor: any) {
    return visitor.visitIfStmt(this);
  }

}

export class Print {
  expression: any;

  constructor(expression: any) {
    this.expression = expression;
  }

  accept(visitor: any) {
    return visitor.visitPrintStmt(this);
  }

}

export class Return {
  keyword: any;
  value: any;

  constructor(keyword: any, value: any) {
    this.keyword = keyword;
    this.value = value;
  }

  accept(visitor: any) {
    return visitor.visitReturnStmt(this);
  }

}

export class Var {
  name: any;
  initializer: any;
  
  constructor(name: any, initializer: any) {
    this.name = name;
    this.initializer = initializer;
  }

  accept(visitor: any) {
    return visitor.visitVarStmt(this);
  }

}

export class While {
  condition: any;
  body: any;

  constructor(condition: any, body: any) {
    this.condition = condition;
    this.body = body;
  }

  accept(visitor: any) {
    return visitor.visitWhileStmt(this);
  }

}