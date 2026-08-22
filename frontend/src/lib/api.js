const BASE = import.meta.env.VITE_API_URL;

let accessToken = null;
let onAuthLost = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function setOnAuthLost(handler) {
  onAuthLost = handler;
}

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function raw(method, path, body) {
