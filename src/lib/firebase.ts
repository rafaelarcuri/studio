import admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK, allowing your Next.js server-side
// code to interact with your Firebase services like Firestore.

// The service account key is loaded from an environment variable for security.
// Ensure your .env.local file has the FIREBASE_SERVICE_ACCOUNT_JSON variable set.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccount) {
  throw new Error('Firebase service account key is not set. Please check your .env.local file.');
}

// Initialize Firebase Admin only if it hasn't been initialized yet.
// This prevents re-initialization errors during hot-reloading in development.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

// Export the Firestore database instance to be used throughout the application.
export const db = admin.firestore();
