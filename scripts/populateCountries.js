 
// This script is for one-time use to populate the 'countries' collection in Firestore.
// To run: `node scripts/populateCountries.js` from the project root.

const admin = require('firebase-admin');
const fetch = require('node-fetch');

// IMPORTANT: Path to your Firebase Admin SDK service account key
// Download this from your Firebase project settings.
// Ensure this file is NOT committed to your repository.
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const COUNTRIES_API_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2,region,subregion,flags';

const populateCountries = async () => {
  console.log('Starting to populate countries...');

  try {
    console.log('Fetching countries from API...');
    const response = await fetch(COUNTRIES_API_URL);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const countriesData = await response.json();
    console.log(`Fetched ${countriesData.length} countries.`);

    const batch = db.batch();
    const countriesCollection = db.collection('countries');

    countriesData.forEach((country) => {
      // Use the 2-letter country code (cca2) as the document ID for easy lookups.
      const docId = country.cca2;
      if (docId) {
        const docRef = countriesCollection.doc(docId);
        const countryPayload = {
          name: country.name.common,
          region: country.region || null,
          subregion: country.subregion || null,
          flagUrl: country.flags.svg,
        };
        batch.set(docRef, countryPayload);
      }
    });

    console.log('Committing batch to Firestore...');
    await batch.commit();
    console.log('✅ Successfully populated countries collection!');
  } catch (error) {
    console.error('❌ Error populating countries:', error);
  }
};

populateCountries();