export function validateMessage(message: string): boolean {
  // Basic validation: check if message is not empty and is a string
  return typeof message === 'string' && message.trim().length > 0;
}
