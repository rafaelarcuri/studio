import admin from 'firebase-admin';

// This file initializes the Firebase Admin SDK, allowing your Next.js server-side
// code to interact with your Firebase services like Firestore.

// The service account key is loaded from an environment variable for security.
// Ensure your .env.local file has the FIREBASE_SERVICE_ACCOUNT_JSON variable set.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let db: admin.firestore.Firestore | null = null;

if (!serviceAccount) {
  console.warn('Firebase service account key is not set. The application will run without database connectivity. Please check your .env.local file.');
} else {
    // Initialize Firebase Admin only if it hasn't been initialized yet.
    // This prevents re-initialization errors during hot-reloading in development.
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccount)),
        });
      } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        console.warn('The application will run without database connectivity.');
      }
    }

    if (admin.apps.length > 0) {
        db = admin.firestore();
    }
}


// Export the Firestore database instance to be used throughout the application.
export { db };
