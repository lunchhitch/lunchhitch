import React from 'react';
import { LunchHitchUser } from '../auth';
import { AuthRequired } from '../common/auth_wrappers';
import NavBar from '../common/navbar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

type Props = {
  user: LunchHitchUser;
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  width: '250px',
  height: '30px',
}));

const ProfileDisplay = ({ user }: Props) => (
  <>
    <NavBar user={user} />
    <Stack spacing={1} style={{alignItems: 'center', color: '#47b16a'}}>
      <h1>My Profile</h1>
      <h3>Name:</h3>
      <Item>{user.displayName}</Item>
      <h3>Username:</h3>
      <Item>{user.username}</Item>
      <h3>Email:</h3>
      <Item>{user.email}</Item>
    </Stack>
  </>
);

export default function ProfilePage() {
  return (
    <AuthRequired>
      {
        (user) => (<ProfileDisplay user={user} />)
      }
    </AuthRequired>
  );
}
