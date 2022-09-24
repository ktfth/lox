import LoxInstance from "./LoxInstance.ts";

export default class LoxClass {
  name: any;
  superclass: any;
  methods: any;

  constructor(name: any, superclass: any, methods: any) {
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  findMethod(name: any) {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
    }

    return null;
  }

  call(interpreter: any, args: any) {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod('init');
    if (initializer !== null) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }

  arity() {
    const initializer = this.findMethod('init');
    if (initializer === null) return 0;
    return initializer.arity();
  }

  toString() {
    return this.name;
  }
}