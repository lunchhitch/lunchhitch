/**
 * auth.ts
 * Functions for managing users
 */
import {
  createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile as updateFirebaseProfile, User,
} from '@firebase/auth';
import {
  signOut as nextAuthSignOut, signIn as nextAuthSignIn, SignInResponse, useSession as useAuthSession, UseSessionOptions,
} from 'next-auth/react';
import { responseSymbol } from 'next/dist/server/web/spec-compliant/fetch-event';
import { FIREBASE_AUTH } from './firebase';
// import prisma from './prisma';

const DEFAULT_DOMAIN = 'lunchhitch.firebaseapp.com';

export type Credential = {
  username: string;
  password: string;
};

export type LunchHitchUser = {
  username: string;
  email: string;
  displayName: string;
  firebaseObj: User;
};

// TODO migrate to server side???
/**
 * Wrapper around the nextauth useSession hook
 */
export function useSession(options: UseSessionOptions<boolean> = { required: false }) {
  const { data: session, status } = useAuthSession(options);

  if (status !== 'authenticated') {
    return {
      user: null,
      status,
    };
  }

  return {
    user: session.user as LunchHitchUser,
    status,
  };
}

async function prismaFetch(username: string, method: string, args: any) {
  const resp = await fetch(`/api/userinfo?username=${username}&method=${method}`, {
    method: 'POST',
    body: JSON.stringify(args),
  });

  const result = await resp.json();
  if (resp.status !== 200) {
    throw result.error;
  }

  return result;
}

/**
 * Sign in with the given username and password
 */
export async function signIn(creds: Credential) {
  return await nextAuthSignIn('credentials', { ...creds, redirect: false }) as unknown as SignInResponse;
}

/**
 * Sign out the current user. Wraps around both the NextAuth signOut and Firebase signOut methods
 */
export async function signOut() {
  await Promise.all([firebaseSignOut(FIREBASE_AUTH), nextAuthSignOut({ redirect: false })]);
}

type SignUpParams = {
  username: string;
  password: string;
  displayName: string;
  email: string;
};

/**
 * Ask the Firebase API to create a new account
 * @param username Username of the new user
 * @param password Password of the new user
 * @param displayName Display name of the new user
 * @param email Email to be associated with the account
 * @returns Created user
 */
export async function signUp({
  username, password, displayName, email,
}: SignUpParams): Promise<void> {
  const result = await createUserWithEmailAndPassword(FIREBASE_AUTH, `${username}@${DEFAULT_DOMAIN}`, password);
  await updateFirebaseProfile(result.user, { displayName });
  await prismaFetch(username, 'create', {
    data: {
      id: username,
      email,
    }
  })
  await firebaseSignOut(FIREBASE_AUTH);
}

export function updateProfile(user: LunchHitchUser, { email, displayName }: Record<'email' | 'displayName', string | undefined>) {
  const tasks: Promise<any>[] = [];

  if (displayName) tasks.push(updateFirebaseProfile(user.firebaseObj, { displayName }));

  // if (email) {
  //   tasks.push(prisma.userInfo.update({
  //     where: {
  //       id: user.username,
  //     },
  //     data: {
  //       email,
  //     },
  //   }));
  // }

  return Promise.all(tasks);
}
