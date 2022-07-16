/* eslint-disable no-shadow */
import React from 'react';
import { UserInfo } from '@prisma/client';
import nookies from 'nookies';

import { fetchApi } from '../api_helpers';
import { FIREBASE_AUTH } from '../firebase';

import { LunchHitchUser } from '.';

export type Session = {
  user: LunchHitchUser;
  status: 'authenticated';
  error: null;
} | {
  user: null;
  status: 'loading' | 'unauthenticated';
  error: null;
} | {
  user: null;
  status: 'errored';
  error: any;
};

const AuthContext = React.createContext<Session>({
  user: null,
  status: 'unauthenticated',
  error: null,
});

/**
 * Wrap _app.tsx with one of these to make the useSession hook available in all
 * components
 */
export function AuthProvider({ children }: any) {
  const [contextObj, setContext] = React.useState<Session>({
    user: null,
    status: 'unauthenticated',
    error: null,
  });

  const setContextObj = (value: Session) => {
    setContext(value);
  };

  React.useEffect(() => FIREBASE_AUTH.onAuthStateChanged(async (user) => {
    if (!user) {
      setContextObj({
        user: null,
        status: 'unauthenticated',
        error: null,
      });
    } else {
      setContextObj({
        user: null,
        status: 'loading',
        error: null,
      });

      try {
        const usernameMatch = user.email!.match(
          /(.+)@lunchhitch.firebaseapp.com/,
        );

        if (!usernameMatch) throw new Error(`Failed to match username: ${user.email}`);

        const userInfoResult = await fetchApi<UserInfo>('userinfo');
        console.log('userInfoResult was', userInfoResult);

        if (userInfoResult.result === 'error') {
          throw new Error(`Prisma did not return userinfo for ${user.email}`);
        }

        setContextObj({
          user: userInfoResult.value,
          status: 'authenticated',
          error: null,
        });
      } catch (error) {
        setContextObj({
          user: null,
          status: 'errored',
          error,
        });
      }
    }
  }), []);

  React.useEffect(
    () => FIREBASE_AUTH.onIdTokenChanged(async (user) => {
      nookies.set(undefined, 'token', user ? await user.getIdToken() : '', {
        path: '/',
      });
    }),
    [],
  );

  React.useEffect(() => {
    const handle = setInterval(async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) await user.getIdToken(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider value={contextObj}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to return the current session information
 */
export const useSession = () => React.useContext(AuthContext);
