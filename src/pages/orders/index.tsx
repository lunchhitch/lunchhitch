import CircularProgress from '@mui/material/CircularProgress';
import { Community, Order, Shop } from '@prisma/client';
import { Form, Formik } from 'formik';
import { useSession } from 'next-auth/react';
import React from 'react';
import { LunchHitchUser } from '../../auth';
import NavBar from '../../common/navbar';
import prisma from '../../prisma';
import FulFillForm from './fulfill_form';
import MakeForm from './make_form';
import ShopSelector from './shop_selector';
import Box from '../../common/components/Box/Box';

type Props = {
  communities: Community[];
}

export default function OrdersPage(props: Props) {
  const [shop, setShop] = React.useState<Shop | null>(null);
  const [popoverOpened, setPopoverOpened] = React.useState(false);

  const { data: session } = useSession({
    required: true,
  });

  const user = session?.user as LunchHitchUser;
  React.useEffect(() => console.log('User object is ', user), [user]);

  if (!session) {
    return (<CircularProgress />);
  }

  return (
    <div
      style={{
        filter: popoverOpened ? 'blur(3px)' : '',
      }}
    >
      <NavBar user={user} />
      <ShopSelector
        communities={props.communities}
        value={shop}
        onChange={setShop}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Box>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            paddingRight: '10px',
          }}
          >
            <Formik<{ order: Order | null }>
              initialValues={{
                order: null,
              }}
              onSubmit={async (values) => {
                // TODO need to figure out how to accept orders
              }}
            >
              {({ isSubmitting, ...formik }) => (
                <Form>
                  <FulFillForm
                    shop={shop}
                    isSubmitting={isSubmitting}
                    onSelect={(order) => formik.setFieldValue('order', order)}
                    onSubmit={formik.submitForm}
                    onPopoverChanged={setPopoverOpened}
                  />
                </Form>
              )}
            </Formik>
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
            <Formik
              initialValues={{
                orders: [],
              }}
              onSubmit={async (values) => {
                return;
                await fetch('/api/prisma?collection=orders&method=create', {
                  method: 'POST',
                  body: JSON.stringify({
                    where: {
                      from: user.username,
                      orders: values.orders,
                      shop: shop!.id,
                    },
                  }),
                });
              }}
            >
              {({ isSubmitting, ...formik }) => (
                <Form>
                  <MakeForm
                    isSubmitting={isSubmitting}
                    onSubmit={() => formik.handleSubmit()}
                    onChange={(newValue) => formik.setFieldValue('orders', newValue)}
                    onPopoverChange={setPopoverOpened}
                    shop={shop}
                  />
                </Form>
              )}
            </Formik>
          </div>
        </Box>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  // TODO:
  // Honestly not sure if we should fetch ALL communities server side
  // or load communities as the user types
  const communities = await prisma.community.findMany();

  return {
    props: {
      communities,
    },
  };
}
