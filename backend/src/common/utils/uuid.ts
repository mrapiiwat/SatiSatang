import { v5 as uuidv5 } from "uuid";

const RAG_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export const generateUUIDFromString = (text: string): string => {
  return uuidv5(text, RAG_NAMESPACE);
};
