import React, {Component} from 'react';
import {Box, Grid, Container, TextField, Typography, Button, withStyles} from "@material-ui/core";
import {withRouter} from 'react-router-dom';

import homeStyles from './styles';
import FooterContainer from "../../components/Footer";
import backgroundImg from '../../assets/images/image-1.jpg';
import backgroundImg2x from '../../assets/images/image-1@2x.jpg';
import backgroundImg3x from '../../assets/images/image-1@3x.jpg';

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trackingCode: '',
    }
  }

  handleFormSubmit = () => {
    const {trackingCode} = this.state;
    const {history} = this.props;

    history.push(`/${trackingCode}`);
  };

  render() {
    const {trackingCode} = this.state;
    const {classes} = this.props;
    const settings = {
      tracking_show_axlehire_support_phone: 'false',
      tracking_show_axlehire_support_email: 'true',
      axlehire_support_phone_number: '+18552497447',
      axlehire_support_phone_email: 'support@axlehire.com',
      tracking_support_email_subject: 'Customer Request Support',
    };

    return (
      <Container maxWidth={false} disableGutters className={classes.container}>
        <Container className={classes.bodyContainer}>
          <Box className={classes.mainContainer}>
            <img src={backgroundImg}
                 srcSet={`${backgroundImg2x} 2x, ${backgroundImg3x} 3x`}
                 alt="Background image"
                 className={classes.mainBackground}
            />
            <Box className={classes.mainForm}>
              <form onSubmit={this.handleFormSubmit}>
                <Box className={classes.mainFormInner}>
                  <Typography variant="h1" className={classes.mainFormTitle}>Track your package with us!</Typography>
                  <Typography variant="h2" className={classes.mainFormSubTitle}>Check the status of your AxleHire shipment</Typography>
                  <Grid container spacing={2} alignItems="center" className={classes.formInputWrapper}>
                    <Grid item className={classes.formInputInner}>
                      <TextField placeholder="Enter your tracking code..."
                                 className={classes.formInput}
                                 color="primary"
                                 fullWidth
                                 variant="outlined"
                                 value={trackingCode}
                                 onChange={(e) => this.setState({trackingCode: e.target.value})}
                      />
                    </Grid>
                    <Grid item>
                      <Button type="submit" size="large" variant="contained" color="primary" className={classes.submitBtn}>
                        Track
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </form>
            </Box>
          </Box>
        </Container>
        {(!settings || !settings.hide_footer || settings.hide_footer === 'false') && (
          <FooterContainer client={{}} settings={settings} />
        )}
      </Container>
    )
  }
}

export default withStyles(homeStyles)(withRouter(HomeContainer));
