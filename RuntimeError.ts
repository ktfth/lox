export default class RuntimeError extends Error {
  token: any;

  constructor(token: any, message: any) {
    super(message);
    this.token = token;
  }
}