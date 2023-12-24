import React, {Component} from 'react';
import {Box, Container} from "@material-ui/core";
import {withStyles} from "@material-ui/core";
import styles from "./styles";
import AxlSupport from "../../components/AxlSupport";
import logo from '../../assets/svg/logo-alt.svg';
import _ from "lodash";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";

class FooterContainer extends Component {
  render() {
    const {classes, client, shipment, settings, store} = this.props;
    const {delivery} = store.deliveryStore;
    const emailSubject = !!settings && eval('`'+settings.tracking_support_email_subject+'`');

    if (!settings) return null;

    const clientUseLogo = JSON.parse(_.get(settings, 'use_client_logo', 'false').toLowerCase()) ? _.get(delivery, 'client.logo_url', logo) : null;

    return (
      <Container className={classes.footerContainer}>
        <Box mx="auto" className={classes.footerWrapper}>
          <Box py={1} className={classes.footerHelp}>
            <Box style={{fontSize: 20, fontWeight: 600}}>Need help?</Box>
            <AxlSupport
              title={`<strong>Got package questions?</strong> <br/> <span>please contact ${client.company}</span>`}
              phone={settings.client_support_phone_number ? `tel:${settings.client_support_phone_number}` : null}
              email={client.support_email ? `mailto:${client.support_email}?subject=${emailSubject}` : null}
            />
            {settings && (settings.tracking_show_axlehire_support_phone === 'true' || settings.tracking_show_axlehire_support_email === 'true')
              ? <AxlSupport 
              title={`<strong>Got delivery questions?</strong> <br/> <span>
                visit our FAQs at <a href=${process.env.REACT_APP_FAQ_URL} style="color:#4a90e2" target="_blank">${process.env.REACT_APP_FAQ_URL}</a>
                <br/>
                or contact AxleHire </span>`}
                            phone={(settings.tracking_show_axlehire_support_phone === 'true' && settings.axlehire_support_phone_number) ? `tel:${settings.axlehire_support_phone_number}` : null}
                            email={(settings.tracking_show_axlehire_support_email === 'true' && settings.axlehire_support_phone_email) ? `mailto:${settings.axlehire_support_phone_email}?subject=${emailSubject}` : null}
              /> : null
            }
          </Box>
          <Box py={3}>
            {!clientUseLogo ? <Box mb={2}>
              <img src={logo} alt="AxleHire" className={classes.footerLogo} height={52}/>
              <strong className={classes.footerBrand}>AxleHire</strong>
            </Box> : <Box mb={2}>
              <img src={clientUseLogo} alt="AxleHire" className={classes.footerLogo} height={52}/>
            </Box>}
            <Box>
              <span>© {new Date().getFullYear()}</span> <strong>AxleHire</strong><span>. All rights reserved.</span>
            </Box>
          </Box>
        </Box>
      </Container>
    )
  }
}

export default withStyles(styles)(compose(
  inject("store"),
  observer
) (FooterContainer));
