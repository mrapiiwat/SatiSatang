import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = uuidv5.DNS;

export function generateUUIDFromString(input: string): string {
  return uuidv5(input, NAMESPACE);
}
