export default class LoxCallable {
  callee: any;

  constructor(callee?: any) {
    this.callee = callee;
  }

  call(interpreter: any, args: any) {
    this.callee.call(interpreter, args);
  }

  arity() {
    return this.callee.declaration.params.length;
  }
}