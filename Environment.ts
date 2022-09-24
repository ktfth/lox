import RuntimeError from "./RuntimeError.ts";

export default class Environment {
  values: any;
  enclosing: any;

  constructor(enclosing?: any) {
    this.values = new Map();
    this.enclosing = enclosing;
  }

  define(name: any, value: any) {
    this.values.set(name, value);
  }

  ancestor(distance: any) {
    let environment = {...this};
    for (let i = 0; i < distance; i += 1) {
      environment = environment.enclosing;
    }

    return environment;
  }

  getAt(distance: any, name: any) {
    return this.ancestor(distance).values.get(name);
  }

  assignAt(distance: any, name: any, value: any) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  get(name: any) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(name,
      `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: any, value: any) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name,
      `Undefined variable '${name.lexeme}'.`);
  }
}