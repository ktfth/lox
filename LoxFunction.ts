import Environment from "./Environment.ts";

export default class LoxFunction {
  declaration: any;
  closure: any;
  isInitializer: any;

  constructor(declaration: any, closure: any, isInitializer: any) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }

  bind(instance: any) {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(this.declaration, environment,
                           this.isInitializer);
  }

  call(interpreter: any, args: any) {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme,
        args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      if (this.isInitializer) return this.closure.getAt(0, 'this');
      return returnValue.value;
    }

    if (this.isInitializer) return this.closure.getAt(0, 'this');
    return null;
  }

  arity() {
    return this.declaration.params.length;
  }

  toString() {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}