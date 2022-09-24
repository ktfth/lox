export default class Return extends Error {
  value: any;

  constructor(value: any) {
    super(value);
    this.value = value;
  }
}