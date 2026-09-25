import { AppError } from '../utils/AppError.js';

export function validateGenerate(req, _res, next) {
  const { bugDescription, targetUrl } = req.body ?? {};
  if (typeof bugDescription !== 'string' || bugDescription.trim().length < 10 || bugDescription.length > 500) {
    throw new AppError(400, 'bugDescription must be between 10 and 500 characters.');
  }
  let url;
  try {
    url = new URL(targetUrl);
  } catch {
    throw new AppError(400, 'targetUrl must be a valid URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new AppError(400, 'targetUrl must start with http:// or https://.');
  next();
}
