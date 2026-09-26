import { Notification } from "../models/Notification.js";

export async function notify(userId, { type, title, body, link }) {
  if (!userId) return;
  await Notification.create({ user: userId, type, title, body, link });
}
