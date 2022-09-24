export default class Token {
  type: any;
  lexeme: any;
  literal: any;
  line: any;

  constructor(type: any, lexeme: any, literal: any, line: any) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}