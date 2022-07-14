import React from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';

import { LunchHitchUser } from '../../auth';
import { useNullableState } from '../../common';
import useAsync from '../../common/async';
import { ConfirmPopover } from '../../common/components/popovers';
import TooltipButton from '../../common/components/tooltip_button';
import { LunchHitchOrder } from '../../prisma';

const getOrdersMade = async () => {
  const result = await fetch('api/orders?fulfiller=true&userOnly=');
  return result.json() as unknown as LunchHitchOrder[];
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
    <div>
      <ConfirmPopover
        name="madeRemovePopover"
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
        renderInput={(params) => (<TextField {...params} placeholder="Shop" />)}
      />
      <List>
        {filteredOrders.map((option, i) => (
          <ListItem key={i}>
            <div>
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
                  <CancelIcon />
                </TooltipButton>
              </div>
              <ol>
                {option.orders.map((each, j) => (<li key={j}>{each}</li>))}
              </ol>
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

/**
 * Display orders that the current user has made
 */
export default function MadeDisplay({ user }: { user: LunchHitchUser }) {
  const orders = useAsync(getOrdersMade);

  React.useEffect(() => {
    orders.call();
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
  }, [user, orders.state]);

  return (
    <>
      <h2 style={{ color: '#47b16a' }}>My Pending Orders</h2>
      {getDisp()}
    </>
  );
}
