import path from 'path';
import { writeFile, readFile, fileExists, createFolder } from './utils.js';

const FIREBASE_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

const envBlock = () =>
  FIREBASE_ENV_KEYS.map((k) => `${k}=`).join('\n') + '\n';

const ensureEnvFileHasFirebase = (filePath) => {
  if (!fileExists(filePath)) {
    writeFile(filePath, envBlock());
    return;
  }
  const existing = readFile(filePath);
  const missing = FIREBASE_ENV_KEYS.filter((k) => !new RegExp(`^${k}=`, 'm').test(existing));
  if (missing.length === 0) return;
  const appended = existing.endsWith('\n') ? existing : existing + '\n';
  writeFile(filePath, appended + missing.map((k) => `${k}=`).join('\n') + '\n');
};

const createFirebaseUtil = (projectPath, isTS) => {
  const utilsDir = path.join(projectPath, 'src', 'utils');
  createFolder(utilsDir);

  const tsContent = `import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, DocumentData } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string,
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

export async function createDoc<T extends DocumentData>(path: string, data: T, id?: string): Promise<string> {
  if (id) {
    await setDoc(doc(db, path, id), data);
    return id;
  }
  const ref = await addDoc(collection(db, path), data);
  return ref.id;
}

export async function readDocById<T>(path: string, id: string): Promise<T | null> {
  const snapshot = await getDoc(doc(db, path, id));
  return snapshot.exists() ? (snapshot.data() as T) : null;
}

export async function readCollection<T>(path: string): Promise<Array<{ id: string; data: T }>> {
  const snap = await getDocs(collection(db, path));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as T }));
}

export async function updateDocById<T>(path: string, id: string, data: Partial<T>): Promise<void> {
  await updateDoc(doc(db, path, id), data as unknown as DocumentData);
}

export async function deleteDocById(path: string, id: string): Promise<void> {
  await deleteDoc(doc(db, path, id));
}
`;

  const jsContent = `import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function createDoc(path, data, id) {
  if (id) {
    await setDoc(doc(db, path, id), data);
    return id;
  }
  const ref = await addDoc(collection(db, path), data);
  return ref.id;
}

export async function readDocById(path, id) {
  const snapshot = await getDoc(doc(db, path, id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function readCollection(path) {
  const snap = await getDocs(collection(db, path));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

export async function updateDocById(path, id, data) {
  await updateDoc(doc(db, path, id), data);
}

export async function deleteDocById(path, id) {
  await deleteDoc(doc(db, path, id));
}
`;

  writeFile(path.join(utilsDir, `firebase.${isTS ? 'ts' : 'js'}`), isTS ? tsContent : jsContent);
};

export const setupFirebase = (projectPath, isTS) => {
  // 1. Create utils with CRUD helpers
  createFirebaseUtil(projectPath, isTS);

  // 2. Ensure env files contain firebase variables, values left blank
  ensureEnvFileHasFirebase(path.join(projectPath, '.env'));
  ensureEnvFileHasFirebase(path.join(projectPath, '.env.example'));

  console.log('✅ Firebase initialized: utils and env variables added');
};
