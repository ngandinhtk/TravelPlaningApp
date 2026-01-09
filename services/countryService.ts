import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase'; // Corrected import path

export interface Country {
  id: string; // The 2-letter ISO code, e.g., 'VN'
  name: string;
  region: string;
  subregion: string;
  flagUrl: string;
}

const countriesCollectionRef = collection(db, 'countries');

/**
 * Fetches all countries from the database, ordered by name.
 * @returns {Promise<Country[]>} A promise that resolves to an array of country objects.
 */
export const getAllCountries = async (): Promise<Country[]> => {
  try {
    const q = query(countriesCollectionRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const countries: Country[] = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Country)
    );
    return countries;
  } catch (error) {
    console.error('Error fetching countries: ', error);
    throw new Error('Could not fetch countries.');
  }
};