import { getFunctions, httpsCallable } from "firebase/functions";
import app from "./config";

// Initialize Firebase Functions
const functions = getFunctions(app);

// URL metadata fetcher function
export const fetchUrlMetadata = async (url) => {
  try {
    const fetchMetadataFn = httpsCallable(functions, 'fetchUrlMetadata');
    const result = await fetchMetadataFn({ url });
    return result.data;
  } catch (error) {
    console.error("Error fetching URL metadata:", error);
    throw error;
  }
};