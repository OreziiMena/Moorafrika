export class UnAuthorizedError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'UnAuthorizedError';
    this.status = 401;
  }
}

export class ForbiddenError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

export class NotFoundError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}