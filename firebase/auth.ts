import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User,
} from '@firebase/auth';
import { FIREBASE_AUTH } from '.';

const DEFAULT_DOMAIN = 'lunchhitch.firebaseapp.com';

/**
 * Query the Firebase API to sign in a user
 * @param username Username of the user to sign in with
 * @param password Password of the user to sign in with
 * @returns Signed in user
 */
export async function signIn(username: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(FIREBASE_AUTH, `${username}@${DEFAULT_DOMAIN}`, password);
  return result.user;
}

/**
 * Ask the Firebase API to create a new account
 * @param username Username of the new user
 * @param password Password of the new user
 * @param displayName Display name of the new user
 * @returns Created user
 */
export async function signUp(username: string, password: string, displayName: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(FIREBASE_AUTH, `${username}@${DEFAULT_DOMAIN}`, password);
  await updateProfile(result.user, { displayName });
  await signOut(FIREBASE_AUTH); // Disable automatic sign in
  return result.user;
}
