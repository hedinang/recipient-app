import React from 'react';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';

import Footer from './Footer';
import DEFAULT_LOGO from '../../assets/svg/logo-alt.svg';

function FooterContainer(props) {
  const { store, client, settings, profile } = props;
  const { delivery } = store.deliveryStore;

  const emailSubject = settings?.tracking_support_email_subject;
  const logo = settings?.use_client_logo === 'true' && delivery?.client?.logo_url ? delivery.client.logo_url : DEFAULT_LOGO;

  const clientConfig = {
    clientLogo: logo,
    clientName: client?.company,
    clientPhone: settings && settings.client_support_phone_number ? settings.client_support_phone_number : '',
    clientCustomText: settings && settings.client_support_custom_text ? settings.client_support_custom_text : '',
    clientEmail: client && client?.support_email ? client?.support_email : null,
    ...profile,
  };

  const clientLogo = clientConfig.clientLogo;
  const clientTitle = clientConfig.clientName ? `<strong>Got package questions?</strong> <br/> <span>please contact ${clientConfig.clientName}</span> \
   <br/> <span>${clientConfig.clientCustomText}</span>` : null;
  const clientPhone = clientConfig?.clientPhone ? `tel:${clientConfig.clientPhone}` : null;
  const clientEmail = clientConfig?.clientEmail ? `mailto:${clientConfig.clientEmail}?subject=${emailSubject}` : null;

  const FAQ_URL = process.env.REACT_APP_FAQ_URL;

  const axlehireConfig = {
    showAxlehireSupportPhone: settings?.tracking_show_axlehire_support_phone,
    showAxlehireSupportEmail: settings?.tracking_show_axlehire_support_email,
    axlehireSupportPhone: settings?.axlehire_support_phone_number,
    axlehireSupportEmail: settings?.axlehire_support_phone_email,
    ...profile,
  };

  const showAxlehireSupport = axlehireConfig.showAxlehireSupportPhone === 'true' || axlehireConfig.showAxlehireSupportEmail === 'true';
  const axlehireTitle = `<strong>Got delivery questions?</strong> <br/> <span>visit our FAQs at <a href=${FAQ_URL} style="color:#4a90e2" target="_blank">${FAQ_URL}</a><br/>or contact AxleHire</span>`;
  const axlehirePhone = axlehireConfig.showAxlehireSupportPhone === 'true' && axlehireConfig.axlehireSupportPhone ? `tel:${axlehireConfig.axlehireSupportPhone}` : null;
  const axlehireEmail = axlehireConfig.showAxlehireSupportEmail === 'true' && axlehireConfig.axlehireSupportEmail ? `mailto:${axlehireConfig.axlehireSupportEmail}?subject=${emailSubject}` : null;

  let dataProps = { clientLogo, clientTitle, clientEmail, clientPhone, showAxlehireSupport, axlehireTitle, axlehireEmail, axlehirePhone };
  if (typeof profile === 'object') dataProps = { ...dataProps, ...profile };

  return <Footer {...dataProps} />;
}

FooterContainer.propTypes = {
  client: PropTypes.shape({
    company: PropTypes.string,
    support_email: PropTypes.string,
  }),
  settings: PropTypes.shape({
    tracking_support_email_subject: PropTypes.string,
    client_support_phone_number: PropTypes.string,
    tracking_show_axlehire_support_phone: PropTypes.string,
    tracking_show_axlehire_support_email: PropTypes.string,
    client_support_custom_text: PropTypes.string,
    axlehire_support_phone_number: PropTypes.string,
    axlehire_support_phone_email: PropTypes.string,
  }),
  profile: PropTypes.shape({
    clientLogo: PropTypes.string,
    clientName: PropTypes.string,
    clientEmail: PropTypes.string,
    clientPhone: PropTypes.string,
    showAxlehireSupportPhone: PropTypes.string,
    showAxlehireSupportEmail: PropTypes.string,
    axlehireSupportPhone: PropTypes.string,
    axlehireSupportEmail: PropTypes.string,
  }),
};

export default compose(inject('store'), observer)(FooterContainer);
