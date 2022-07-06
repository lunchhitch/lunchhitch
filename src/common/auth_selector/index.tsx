import React from 'react';
import { useRouter } from 'next/router';

import { LunchHitchUser } from '../../auth';
import { useSession } from '../../auth/auth_provider';

import LoadingScreen from './loading_screen';

type Props = ({
  /**
   * If provided a string, the user will be redirected to that page on authentication\
   * Otherwise a React component can be provided
   */
  children: React.ReactElement<any> | ((user: LunchHitchUser) => React.ReactElement<any>);
  authenticated: undefined;
} | {
  children: undefined;
  authenticated: string | (() => void);
}) & {
  /**
   * Provide a string to redirect the user when they are not logged in\
   * or a React component to display\
   * Set to null or undefined to redirect the user to the login page
   */
  unauthenticated?: React.ReactElement<any> | string | null;

  /**
   * Provide a string to redirect the user to while waiting for the session to load\
   * or a React component to display\
   * Set to null or undefined to display the default loading screen
   */
  loading?: React.ReactElement<any> | string | null;
};

/**
 * Component for displaying different results based on the current authentication status
 */
export default function AuthSelector({ unauthenticated, loading, ...props }: Props) {
  const router = useRouter();
  const { user, status } = useSession();
  // Wrap router usage in useEffect
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      if (!unauthenticated) {
        router.push(`/auth/login?callback=${router.pathname}`);
      } else if (typeof unauthenticated === 'string') {
        router.push(unauthenticated);
      }
    } else if (status === 'loading' && typeof loading === 'string') {
      router.push(loading);
    } else if (status === 'authenticated' && typeof props.authenticated === 'string') {
      router.push(props.authenticated);
    }
  }, [status, router]);

  switch (status) {
    case 'authenticated': {
      if (props.authenticated) {
        if (typeof props.authenticated !== 'string') props.authenticated();
        return null as never;
      } else if (typeof props.children === 'function') {
        return props.children(user);
      } else {
        return props.children!;
      }
    }
    case 'unauthenticated': {
      if (unauthenticated && typeof unauthenticated !== 'string') {
        return unauthenticated;
      } else return null as never;
    }
    case 'loading': {
      if (!loading) {
        return <LoadingScreen />;
      } else if (typeof loading !== 'string') {
        return loading;
      } else return null as never;
    }
    default: return null as never;
  }
}

AuthSelector.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  authenticated: undefined,
  unauthenticated: null,
  loading: null,
};
