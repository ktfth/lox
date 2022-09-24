import RuntimeError from "./RuntimeError.ts";

export default class LoxInstance {
  klass: any;
  fields: any;

  constructor(klass: any) {
    this.klass = klass;

    this.fields = new Map();
  }

  toString() {
    return this.klass.name + ' instance';
  }

  get(name: any) {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method !== null) return method.bind(this);

    throw new RuntimeError(name,
      `Undefined property \'${name.lexeme}\'.`);
  }

  set(name: any, value: any) {
    this.fields.set(name.lexeme, value);
  }
}