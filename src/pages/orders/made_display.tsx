import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { fetchApi } from '../../api_helpers';
import { SessionUser, useNullableState } from '../../common';
import useAsync from '../../common/async';
import Box from '../../common/components/Box';
import { ConfirmPopover } from '../../common/components/popovers';
import TooltipButton from '../../common/components/tooltip_button';
import { LunchHitchOrder } from '../../prisma';

const getOrdersMade = async (user: SessionUser) => {
  const result = await fetchApi<LunchHitchOrder[]>('orders', {
    where: {
      OR: [{ fromId: user.username }, { fulfillerId: user.username }],
    },
  });
  if (result.result === 'error') throw result.value;
  return result.value;
};

type OrderDisplayProps = {
  orders: LunchHitchOrder[];
  onRemove: (index: number, order: LunchHitchOrder) => void;
};

const OrderDisplay = ({ orders, onRemove }: OrderDisplayProps) => {
  const shops = Array.from(new Set(orders.map((order) => order.shop)));
  const [selectedShop, setSelectedShop] = useNullableState<string>();
  const filteredOrders = selectedShop ? orders.filter((order) => order.shop.name.match(selectedShop)) : orders;

  return (
    <>
      <ConfirmPopover
        name="madeRemove"
        confirmAction={() => {

        }}
      >
        Remove this order?
      </ConfirmPopover>
      <Autocomplete
        options={shops}
        value={selectedShop}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
        onChange={(_event, value) => setSelectedShop(typeof value === 'string' ? value : (value?.name) ?? null)}
        freeSolo
        renderInput={(params) => (<TextField variant="standard" {...params} placeholder="Search" />)}
      />
      <List>
        {filteredOrders.map((option, i) => (
          <ListItem key={i}>
            <Box>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <h3>Order from {option.shop.name}</h3>
                <TooltipButton
                  tooltip="Remove this order"
                  onClick={() => onRemove(i, option)}
                >
                  <DeleteIcon />
                </TooltipButton>
              </div>
              <ol>
                {option.orders.map((each, j) => (<li key={j}>{each}</li>))}
              </ol>
            </Box>
          </ListItem>
        ))}
      </List>
    </>
  );
};

/**
 * Display orders that the current user has made
 */
export default function MadeDisplay({ user }: { user: SessionUser }) {
  const orders = useAsync(getOrdersMade);

  React.useEffect(() => {
    orders.call(user);
    return orders.cancel;
  }, [user]);

  const getDisp = React.useCallback(() => {
    switch (orders.state) {
      case 'waiting':
      case 'loading': return <CircularProgress />;
      case 'errored': return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2>:(</h2>
          <p>An error occurred</p>
          {process.env.NODE_ENV === 'production' ? '' : orders.result.toString()}
        </div>
      );
      case 'done': {
        if (orders.result.length === 0) return <>You have no pending orders</>;

        return (
          <OrderDisplay
            onRemove={() => {}}
            orders={orders.result}
          />
        );
      }
      default: return null as never;
    }
  }, [orders.state]);

  return (
    <Box style={{ backgroundColor: 'rgba(230, 230, 250, 0.9)' }}>
      <Stack direction="row" spacing={1}>
        <h2 style={{ color: '#47b16a' }}>My Pending Orders</h2>
        <TooltipButton
          tooltip="Refresh"
          onClick={() => orders.call(user)}
        >
          <RefreshIcon />
        </TooltipButton>
      </Stack>
      {getDisp()}
    </Box>
  );
}
