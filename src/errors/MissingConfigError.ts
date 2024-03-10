class MissingConfigError extends Error {
  constructor({message}: { message: string }) {
    super(message);
    this.name = "MissingConfigError";
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else { 
      this.stack = (new Error(message)).stack; 
    }
  }
}