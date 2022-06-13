/**
 * auth.ts
 * Functions for managing users
 */
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User,
} from '@firebase/auth';
import { FIREBASE_AUTH } from './firebase';
import getPrisma from './prisma';

const DEFAULT_DOMAIN = 'lunchhitch.firebaseapp.com';

export type Credential = {
  username: string;
  password: string;
};

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
 * @param email Email to be associated with the account
 * @returns Created user
 */
export async function signUp(username: string, password: string, displayName: string, email: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(FIREBASE_AUTH, `${username}@${DEFAULT_DOMAIN}`, password);
  await updateProfile(result.user, { displayName });

  // Update our db containing userinfo
  const dbtask = getPrisma().userInfo.create({
    data: {
      username,
      email,
    },
  }); // and update our own db
  await Promise.resolve([signOut(FIREBASE_AUTH), dbtask]);
  return result.user;
}