export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
}
