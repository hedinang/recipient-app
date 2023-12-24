import React, {Component} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, ElementsConsumer, PaymentRequestButtonElement, CardElement, CardNumberElement, CardCvcElement, CardExpiryElement} from '@stripe/react-stripe-js';
import {withStyles, Box, Button, TextField, RadioGroup, FormControlLabel, LinearProgress, Grid} from "@material-ui/core";

import styles from "./styles";
import RadioButton from "../RadioButton";
import withMediaQuery from "../../constants/mediaQuery";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

class StripeForm extends Component {
  CARD_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      errorMsg: '',
      canMakePayment: false,
      hasCheckedAvailability: false,
      method: "card",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {hasCheckedAvailability} = this.state;
    const {elements, stripe, tipping, beforeSubmit, onError, onFail, onSuccess} = this.props;

    if (!stripe || !elements || hasCheckedAvailability) return false;

    this.paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: tipping.currency,
      total: {
        label: 'Tip AxleHire Driver',
        amount: Math.round(tipping.amount.toFixed(2) * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    this.paymentRequest.canMakePayment().then(result => {
      this.setState({hasCheckedAvailability: true});
      if (result) this.setState({canMakePayment: true});
    });

    // handle pay not via credit card
    this.paymentRequest.on("paymentmethod", async (ev) => {
      if (!tipping.tip_client_secret) {
        ev.complete('fail');
        return false;
      }

      if (beforeSubmit) beforeSubmit();
      const result = await stripe.confirmCardPayment(
        tipping.tip_client_secret,
        {payment_method: ev.paymentMethod.id},
        {handleActions: false}
      );

      if (result.error) {
        // Report to the browser that the payment failed, prompting it to
        // re-show the payment interface, or show an error message and close
        // the payment interface.
        ev.complete('fail');
        this.setState({errorMsg: result.error.message});
        if (onFail) onFail();
      } else {
        // Report to the browser that the confirmation was successful, prompting
        // it to close the browser payment method collection interface.
        ev.complete('success');
        if (result.paymentIntent.status === 'succeeded') {
          if (onSuccess) onSuccess();
        }
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    const {elements, stripe, tipping, beforeSubmit, onError, onFail, onSuccess} = this.props;

    if (!stripe || !elements) return false;
    if (!tipping || !tipping.tip_client_secret) return false;

    try {
      if (beforeSubmit) beforeSubmit();
      stripe.confirmCardPayment(tipping.tip_client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        }
      }).then(result => {
        if (result.error) {
          this.setState({errorMsg: result.error.message});
          if (onFail) onFail();
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            if (onSuccess) onSuccess();
          }
        }
      })
    } catch (e) {
      if (onError) onError();
    }
  };

  render() {
    const {errorMsg, canMakePayment, hasCheckedAvailability} = this.state;
    const {classes, mediaQuery} = this.props;

    if (!hasCheckedAvailability) {
      return (
        <Box>
          <LinearProgress color="primary" />
          <Box py={1} style={{textAlign: 'center'}}>Checking for available payment method...</Box>
        </Box>
      )
    }

    return (
      <Box>
        <form onSubmit={this.handleSubmit}>
          <Box className={classes.paymentWrapper}>
            {canMakePayment && (
              <Box py={1} style={{maxWidth: 300, margin: 'auto'}}>
                <PaymentRequestButtonElement
                  options={{
                    style: {
                      paymentRequestButton: {
                        type: 'default',
                        theme: 'dark',
                      },
                    },
                    paymentRequest: this.paymentRequest,
                  }}
                />
              </Box>
            )}
            <Box>
              <Box py={1.5} className={classes.boxWrapper}>
                <Box className={classes.boxDecorator} />
                <span className={classes.boxText}>{canMakePayment ? "OR PAY WITH CARD" : "CREDIT CARD"}</span>
              </Box>
              <Grid container spacing={1} style={{marginBottom: 10}}>
                <Grid item xs={12}>
                  <Box mx="auto" p={1} className={classes.cardElementWrapper}>
                    <CardNumberElement
                      options={this.CARD_OPTIONS}
                      onChange={e => this.setState({errorMsg: ''})}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box mx="auto" p={1} className={classes.cardElementWrapper}>
                    <CardExpiryElement
                      options={this.CARD_OPTIONS}
                      onChange={e => this.setState({errorMsg: ''})}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box mx="auto" p={1} className={classes.cardElementWrapper}>
                    <CardCvcElement
                      options={this.CARD_OPTIONS}
                      onChange={e => this.setState({errorMsg: ''})}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box my={1} className={classes.error}>{errorMsg}</Box>
          <Box py={2} display="flex" className={classes.buttonWrapper}>
            <Button variant={mediaQuery.isMobile ? "text" : "outlined"}
                    color="primary"
                    className={classes.button}
                    onClick={() => this.props.onBack()}
            >
              Back
            </Button>
            <Button type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.button}
            >
              Pay
            </Button>
          </Box>
        </form>
      </Box>
    );
  }
}

const InjectedStripeForm = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <ElementsConsumer>
        {({elements, stripe}) => (
          <StripeForm elements={elements} stripe={stripe} {...props} />
        )}
      </ElementsConsumer>
    </Elements>
  )
};

export default withStyles(styles)(withMediaQuery()(InjectedStripeForm));
