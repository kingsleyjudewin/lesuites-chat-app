export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
