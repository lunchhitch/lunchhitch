import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Shop } from '@prisma/client';
import {
  Field, FieldArray, FieldProps, Form, Formik, FormikContext, FormikContextType,
} from 'formik';
import { DateTime } from 'luxon';
import * as yup from 'yup';

import { fetchApiThrowOnError } from '../../../api_helpers';
import Box from '../Box';
import { connectPopover, usePopoverContext } from '../popovers';
import TooltipButton from '../tooltip_button';

type MakeFormValues = {
  orders: string[];
  deliverBy: DateTime;
}

const MAX_ORDERS = 10;

class Persister extends React.Component {
  componentWillUnmount() {
    if (window) window.localStorage.setItem('makeform', JSON.stringify((this.context as FormikContextType<MakeFormValues>).values));
  }

  render() {
    return null;
  }
}

Persister.contextType = FormikContext;

const LinkedDialog = connectPopover(Dialog);

export default function MakeForm({ shop }: { shop: Shop | null }) {
  const { setPopover } = usePopoverContext();

  const [orderField, setOrderField] = React.useState({
    value: '',
    error: false,
    helperText: '',
  });

  let initialValues: MakeFormValues;

  if (typeof window !== 'undefined') {
    const sessionValues = window.localStorage.getItem('makeform');
    if (sessionValues) {
      const parsed = JSON.parse(sessionValues);
      initialValues = {
        ...parsed,
        deliverBy: DateTime.fromISO(parsed.deliverBy),
      };
    } else {
      initialValues = { orders: [], deliverBy: DateTime.now() };
    }
  } else {
    initialValues = { orders: [], deliverBy: DateTime.now() };
  }

  return (
    <Formik<MakeFormValues>
      initialValues={initialValues}
      onSubmit={async ({ orders, deliverBy }, { resetForm }) => {
        try {
          await fetchApiThrowOnError('orders/create', {
            orders,
            shopId: shop!.id,
            deliverBy: deliverBy.toJSDate(),
          });

          setOrderField({
            value: '',
            error: false,
            helperText: 'Placed order!',
          });
          resetForm({
            values: {
              deliverBy: DateTime.now(),
              orders: [],
            },
          });
          setPopover('makeFormSuccess', true);
        } catch (error: any) {
          // TODO submit error handling
          setOrderField({
            value: orderField.value,
            error: true,
            helperText: error.toString(),
          });
        }
      }}
      validationSchema={yup.object({
        orders: yup.array().of(yup.string().required('Order cannot be empty!')),
        deliverBy: yup.date().min(DateTime.now(), 'Invalid deliver by time!'),
      })}
    >
      {({
        values: { orders }, errors, isSubmitting, setFieldValue, submitForm,
      }) => (
        <Form>
          <Persister />
          <FieldArray name="orders">
            {(ordersHelpers) => {
              const addOrder = (order: string, index?: number) => {
                if (orders.length >= MAX_ORDERS) {
                  setOrderField({
                    ...orderField,
                    helperText: 'Maximum number of orders reached!',
                    error: true,
                  });
                  return;
                }

                if (index) {
                  ordersHelpers.insert(index, order);
                } else {
                  ordersHelpers.push(order);
                }
                setOrderField({
                  ...orderField,
                  helperText: `Added ${order}`,
                  error: false,
                });
              };

              return (
                <Box style={{
                  backgroundColor: 'rgba(255, 217, 217, 0.9)', height: '450px', overflow: 'hidden', overflowY: 'scroll', width: '100%',
                }}
                >
                  <Stack direction="column">
                    <h2 style={{ color: '#47b16a', textAlign: 'center', paddingBottom: '15px' }}>Make an Order!</h2>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        {...orderField}
                        disabled={shop === null}
                        variant="standard"
                        placeholder="Enter your order here"
                        onKeyUp={(event) => {
                          if (event.key === 'Escape') {
                            if (orderField.value === '') {
                              (event.target as any).blur();
                            } else {
                              setOrderField({
                                value: '',
                                error: false,
                                helperText: '',
                              });
                            }

                            event.preventDefault();
                          } else if (event.key === 'Enter' && orderField.value !== '') {
                            addOrder(orderField.value);
                            event.preventDefault();
                          }
                        }}
                        onChange={(event) => setOrderField({
                          ...orderField,
                          value: event.target.value,
                        })}
                        onSubmit={() => {
                          if (orderField.value) {
                            addOrder(orderField.value);
                            setOrderField({
                              value: '',
                              error: false,
                              helperText: '',
                            });
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <TooltipButton
                                onClick={() => {
                                  if (orderField.value) {
                                    addOrder(orderField.value);
                                    setOrderField({
                                      value: '',
                                      error: false,
                                      helperText: '',
                                    });
                                  }
                                }}
                                tooltip={`Add ${orderField.value}`}
                                disabled={!orderField.value || !shop}
                              >
                                <AddIcon />
                              </TooltipButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <Field
                          name="deliverBy"
                        >
                          {({ field: { value, ...field }, meta }: FieldProps<MakeFormValues>) => (
                            <DateTimePicker
                              {...field}
                              value={value}
                              onChange={(v) => {
                                setOrderField({
                                  value: orderField.value,
                                  error: false,
                                  helperText: '',
                                });
                                setFieldValue('deliverBy', v, true);
                              }}
                              disabled={!shop}
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              renderInput={({ error, ...params }) => (
                                <TextField
                                  placeholder="Deliver By Time"
                                  variant="standard"
                                  error={!!meta.error && meta.touched}
                                  helperText={meta.error}
                                  {...params}
                                />
                              )}
                            />
                          )}
                        </Field>
                      </LocalizationProvider>
                    </Stack>
                    <Box style={{ backgroundColor: 'rgba(255, 217, 217, 0.9)' }}>
                      {orders.length === 0 ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <p style={{
                            color: '#7c807d',
                          }}
                          >Add some orders to begin!
                          </p>
                        </div>
                      ) : (
                        <Stack>
                          {orders.map((order, i) => (
                            <Stack direction="row" key={i}>
                              <TooltipButton
                                tooltip={`Remove ${order}`}
                                onClick={() => {
                                  ordersHelpers.remove(i);
                                  setOrderField({
                                    ...orderField,
                                    error: false,
                                    helperText: `Removed ${order}`,
                                  });
                                }}
                              >
                                <RemoveIcon />
                              </TooltipButton>
                              <TooltipButton
                                tooltip={`Duplicate ${order}`}
                                onClick={() => addOrder(order, i)}
                              >
                                <ContentCopyIcon />
                              </TooltipButton>
                              <Field name={`orders.${i}`}>
                                {({ field, meta }: FieldProps<MakeFormValues>) => (
                                  <TextField
                                    variant="standard"
                                    {...field}
                                    error={meta.touched && !!meta.error}
                                    helperText={meta.error}
                                  />
                                )}
                              </Field>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Box>
                    <div style={{
                      display: 'inline',
                    }}
                    >
                      {/* clear orders */}
                      <LinkedDialog
                        name="makeFormClear"
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        {({ setState }) => (
                          <>
                            <DialogTitle id="alert-dialog-title">
                              Clear Orders
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-description">
                                Are you sure you want to clear all orders?
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={() => setState(false)} autoFocus style={{ color: '#faa7a7' }}>Cancel</Button>
                              <Button
                                onClick={() => {
                                  setFieldValue('orders', []);
                                  setOrderField({
                                    value: '',
                                    error: false,
                                    helperText: 'Cleared all orders',
                                  });
                                  setState(false);
                                }}
                                autoFocus
                                style={{ color: '#50C878' }}
                              >Confirm
                              </Button>
                            </DialogActions>
                          </>
                        )}
                      </LinkedDialog>
                      {/* submit orders */}
                      <TooltipButton
                        style={{
                          paddingLeft: '10px',
                        }}
                        disabled={orders.length === 0}
                        tooltip="Remove all orders"
                        onClick={() => setPopover('makeFormClear', true)}
                        startIcon={<DeleteIcon />}
                      >
                        Clear Orders
                      </TooltipButton>
                      <LinkedDialog
                        name="makeFormConfirm"
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        {({ close }) => (
                          <>
                            <DialogTitle id="alert-dialog-title">
                              Confirm the following order from {shop?.name}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-description">
                                <ol>
                                  {orders.map((order, i) => (<li key={i}>{order}</li>))}
                                </ol>
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={() => close()} autoFocus style={{ color: '#faa7a7' }}>Cancel</Button>
                              <Button
                                onClick={async () => {
                                  await submitForm();
                                  setOrderField({
                                    value: '',
                                    error: false,
                                    helperText: '',
                                  });
                                  close();
                                  // Open it after submit form finishes
                                  // setPopover('makeFormSuccess', true);
                                }}
                                autoFocus
                                style={{ color: '#50C878' }}
                              >Confirm
                              </Button>
                            </DialogActions>
                          </>
                        )}
                      </LinkedDialog>
                      <TooltipButton
                        disabled={
                        orders.length === 0
                        || isSubmitting
                        || !shop
                        || Object.values(errors).length > 0
                      }
                        tooltip="Submit this order!"
                        onClick={() => setPopover('makeFormConfirm', true)}
                        endIcon={(
                          <Badge color="primary" badgeContent={orders.length}>
                            <ShoppingCartCheckoutIcon />
                          </Badge>
                      )}
                      >
                        Submit Orders
                      </TooltipButton>
                      <p style={{ float: 'right', paddingRight: '20px' }}>{orders.length}/{MAX_ORDERS} Orders</p>
                    </div>
                    {/* order succeeded */}
                    <LinkedDialog
                      name="makeFormSuccess"
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      {({ close }) => (
                        <>
                          <DialogTitle id="alert-dialog-title">
                            Success
                          </DialogTitle>
                          <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                              Successfully placed your order! <br />
                              The app will automatically lead you to the payment page once someone has offered to fulfill your order.
                            </DialogContentText>
                          </DialogContent>
                          <DialogActions>
                            <Button
                              onClick={() => close()}
                              autoFocus
                              style={{ color: '#50C878' }}
                            >Close
                            </Button>
                          </DialogActions>
                        </>
                      )}
                    </LinkedDialog>
                  </Stack>
                </Box>
              );
            }}
          </FieldArray>
          {/* <ConfirmPopover
            name="makeFormClear"
            confirmAction={() => {
              setFieldValue('orders', []);
              setOrderField({
                ...orderField,
                error: false,
                helperText: 'Orders cleared',
              });
            }}
          >
            <h3 style={{ fontFamily: 'Raleway', padding: '20px' }}>Are you sure you want to clear all orders?</h3>
          </ConfirmPopover>
          <ConfirmPopover
            name="makeFormConfirm"
            confirmAction={() => {
              submitForm();
              setOrderField({
                value: '',
                error: false,
                helperText: '',
              });
            }}
          >
            <Stack direction="column">
              <h3 style={{ fontFamily: 'Raleway', padding: '20px' }}>Confirm the following order from {shop?.name}</h3>
              <ol>
                {orders.map((order, i) => (<li key={i}>{order}</li>))}
              </ol>
            </Stack>
          </ConfirmPopover>
          <LinkedClickAwayPopover name="makeSuccess">
            <Stack direction="column">
              <CheckCircleIcon />
              Successfully placed your order!
            </Stack>
          </LinkedClickAwayPopover> */}
        </Form>
      )}
    </Formik>
  );
}
