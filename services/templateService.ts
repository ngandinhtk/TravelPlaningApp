import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
const templatesCollection = collection(db, "templates");

/**
 * Fetches all trip templates.
 * @returns {Promise<Array>} A promise that resolves to an array of all templates.
 */
export const getAllTemplates = async () => {
  const querySnapshot = await getDocs(templatesCollection);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const createTemplate = async (newTemplate: any) => {
  // console.log('Creating template:', newTemplate);
  const docRef = await addDoc(templatesCollection, {
    ...newTemplate,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const addTemplate = createTemplate;

/**
 * Checks if a template name already exists in the database.
 * @param {string} name - The name of the template to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the name exists, false otherwise.
 */
export const checkTemplateNameExists = async (
  name: string,
): Promise<boolean> => {
  // Firestore queries are case-sensitive. For a case-insensitive check,
  // you would typically store a lowercase version of the name.
  // For this implementation, we'll use a case-sensitive check.
  const q = query(templatesCollection, where("name", "==", name), limit(1));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const deleteTemplate = async (templateId: string) => {
  const templateDoc = doc(db, "templates", templateId);
  await deleteDoc(templateDoc);
};

export const updateTemplate = async (templateId: string, updatedData: any) => {
  const templateDoc = doc(db, "templates", templateId);
  await updateDoc(templateDoc, {
    ...updatedData,
    updatedAt: new Date().toISOString(),
  });
};
