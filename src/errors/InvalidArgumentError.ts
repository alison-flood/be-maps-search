class InvalidArgumentError extends Error {
  field: string
  constructor({message, field}: { message: string, field: string }) {
    super(message);
    this.name = "InvalidArgumentError";
    this.field = field;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else { 
      this.stack = (new Error(message)).stack; 
    }
  }
}