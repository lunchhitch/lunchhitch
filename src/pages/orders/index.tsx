/* eslint-disable no-empty-pattern */
import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Button, Stack,
} from '@mui/material';
import { Shop } from '@prisma/client';
import { GetServerSideProps } from 'next';

import testUser from '../../auth/test_user';
import { APIResult, wrapApiResult } from '../../common';
import AuthSelector from '../../common/auth_selector';
import Box from '../../common/components/Box/Box';
import NavBar from '../../common/components/navbar';
import { LinkedPopover, PopoverContainer } from '../../common/components/popovers';
import { getSession } from '../../firebase/admin';
import prisma, { LunchHitchCommunity } from '../../prisma';

import FulFillForm from './fulfill_form';
import MadeDisplay from './made_display';
import MakeForm from './make_form';
import ShopSelector from './shop_selector';

type Props = {
  communities: APIResult<LunchHitchCommunity[]>;
}

const OrdersPage = ({ communities }: Props) => {
  const [shop, setShop] = React.useState<Shop | null>(null);

  return (
    <AuthSelector force>
      {(user) => (
        <>
          <NavBar user={user} />
          <PopoverContainer
            popovers={{
              errorPopover: communities.result === 'error',
              fulfillPopover: false,
              makeFormClear: false,
              makeFormConfirm: false,
            }}
          >
            <LinkedPopover
              name="errorPopover"
            >
              <p style={{
                textAlign: 'center',
              }}
              >
                An error occurred<br />
                Reload the page to try again<br />
                {communities.result === 'error' && communities.value}<br />
              </p>
            </LinkedPopover>
            <Stack direction="column">
              <ShopSelector
                communities={communities.value}
                value={shop}
                onChange={setShop}
              />
              <Stack direction="row">
                <Box>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingRight: '10px',
                  }}
                  >
                    <FulFillForm shop={shop} />
                  </div>
                </Box>
                <Box>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignContent: 'center',
                    }}
                  >
                    <h2 style={{ color: '#47b16a' }}>Place an Order!</h2>
                    <MakeForm shop={shop} />
                  </div>
                </Box>
              </Stack>
              {/* <MadeDisplay user={user} /> */}
            </Stack>
          </PopoverContainer>
        </>
      )}
    </AuthSelector>
  );
};

export default OrdersPage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  // const user = await getSession(req.cookies.token);
  const user = testUser.username;
  console.log('User is', user);
  // TODO:
  // Honestly not sure if we should fetch ALL communities server side
  // or load communities as the user types
  const communities = await wrapApiResult(() => prisma.community.findMany({
    include: {
      shops: true,
    },
  }));

  return {
    props: {
      communities,
    },
  };
};
