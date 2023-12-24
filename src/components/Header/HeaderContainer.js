import React from 'react';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';

import Header from './Header';
import DEFAULT_LOGO from '../../assets/svg/logo.svg';

function HeaderContainer(props) {
  const { menuItems, store } = props;

  const { settings, loadingDelivery, delivery } = store.deliveryStore;
  const logo = settings?.use_client_logo === 'true' && delivery?.client?.logo_url ? delivery.client.logo_url : DEFAULT_LOGO;

  const clientConfig = { menuItems, logo };
  const hidden = loadingDelivery || settings?.hide_header === 'true';

  return !hidden && <Header {...clientConfig} />;
}

HeaderContainer.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.object),
  profile: PropTypes.shape({
    clientLogo: PropTypes.string,
  }),
};

export default compose(inject('store'), observer)(HeaderContainer);
