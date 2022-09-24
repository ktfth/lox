export class Expr {}

export class Assign {
  name: any;
  value: any;

  constructor(name: any, value: any) {
    this.name = name;
    this.value = value;
  }

  accept(visitor: any) {
    return visitor.visitAssignExpr(this);
  }

}

export class Binary {
  left: any;
  operator: any;
  right: any;

  constructor(left: any, operator: any, right: any) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: any) {
    return visitor.visitBinaryExpr(this);
  }

}

export class Call {
  callee: any;
  paren: any;
  args: any;

  constructor(callee: any, paren: any, args: any) {
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept(visitor: any) {
    return visitor.visitCallExpr(this);
  }

}

export class Get {
  object: any;
  name: any;

  constructor(object: any, name: any) {
    this.object = object;
    this.name = name;
  }

  accept(visitor: any) {
    return visitor.visitGetExpr(this);
  }

}

export class Grouping {
  expression: any;

  constructor(expression: any) {
    this.expression = expression;
  }

  accept(visitor: any) {
    return visitor.visitGroupingExpr(this);
  }

}

export class Literal {
  value: any;

  constructor(value: any) {
    this.value = value;
  }

  accept(visitor: any) {
    return visitor.visitLiteralExpr(this);
  }

}

export class Logical {
  left: any;
  operator: any;
  right: any;

  constructor(left: any, operator: any, right: any) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: any) {
    return visitor.visitLogicalExpr(this);
  }

}

export class Set {
  object: any;
  name: any;
  value: any;

  constructor(object: any, name: any, value: any) {
    this.object = object;
    this.name = name;
    this.value = value;
  }

  accept(visitor: any) {
    return visitor.visitSetExpr(this);
  }

}

export class Super {
  keyword: any;
  method: any;

  constructor(keyword: any, method: any) {
    this.keyword = keyword;
    this.method = method;
  }

  accept(visitor: any) {
    return visitor.visitSuperExpr(this);
  }

}

export class This {
  keyword: any;

  constructor(keyword: any) {
    this.keyword = keyword;
  }

  accept(visitor: any) {
    return visitor.visitThisExpr(this);
  }

}

export class Unary {
  operator: any;
  right: any;

  constructor(operator: any, right: any) {
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: any) {
    return visitor.visitUnaryExpr(this);
  }

}

export class Variable {
  name: any;

  constructor(name: any) {
    this.name = name;
  }

  accept(visitor: any) {
    return visitor.visitVariableExpr(this);
  }

}