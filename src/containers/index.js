import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { withStyles, ThemeProvider } from '@material-ui/core';
import _ from 'lodash';

// internal
import { defaultTheme } from '../themes';
import { airShop } from '../themes';
import MainContainer from './main';
import ListContainer from './list';
import HomeContainer from './home';
import EditShipmentContainer from './EditShipment';
import SignatureContainer from './signature';
import Header from '../components/Header';
import IdScanContainer from './IdScan';
import PODContainer from './pod';
import TimelineCompose from './embed/timeline';
import PageNotfoundContainer from './404';
import ErrorPageContainer from './Error';
import styles from './styles';
import menuItems from '../constants/menuItems';
import Thankyou from 'components/DeliveryManager/Thankyou';
import { ManageDelivery } from 'containers/ManageDelivery';
import { ManageDeliveryContainer, RedirectManageDelivery } from 'containers/AccessCode';

class AppContainer extends Component {
  render() {
    const { pageTheme } = this.props.store.deliveryStore;
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <Router>
          <ThemeProvider theme={pageTheme}>
            <Route
              exact
              path={['/', '/:tracking_code', '/v1/:tracking_code', '/noredirect/:tracking_code', '/:tracking_code/edit', '/:tracking_code/signature', '/:tracking_code/idscan', '/error', '/list/:tracking_codes', '/list/noredirect/:tracking_codes', '/:trackingCode/delivery', '/:trackingCode/sessions', '/:trackingCode/sessions/completed', '/:trackingCode/v2/edit']}
              render={(props) => {
                if (_.includes(props.match.url, `/404`)) {
                  return null;
                }
                return <Header menuItems={menuItems} />;
              }}
            />
            <Route exact path={['/list/:tracking_codes', '/list/noredirect/:tracking_codes']} component={ListContainer} />
            <Route exact path={['/404', '/noredirect/404']} component={PageNotfoundContainer} />
            <Route exact path={['/error', '/noredirect/error']} component={ErrorPageContainer} />
            <Route exact path="/" component={HomeContainer} />
            <Route exact path="/noredirect/:tracking_code" component={MainContainer} />
            <Route exact path="/:tracking_code" component={MainContainer} />
            <Route exact path="/:tracking_code/signature" component={SignatureContainer} />
            <Route exact path="/:tracking_code/timeline" component={TimelineCompose} />
            <Route path="/:tracking_code/v2/edit" component={EditShipmentContainer} />
            <Route path="/:tracking_code/idscan" component={IdScanContainer} />
            <Route path="/showpod/:data" component={PODContainer} />
            <Route exact path="/:trackingCode/delivery" component={RedirectManageDelivery} />
            <Route exact path="/:trackingCode/sessions" component={ManageDeliveryContainer} />
            <Route exact path="/:trackingCode/sessions/completed" component={Thankyou} />
            <Route exact path="/:trackingCode/edit" component={ManageDelivery} />
          </ThemeProvider>
        </Router>
      </div>
    );
  }
}

const RootCompose = compose(inject('store'), observer)(AppContainer);

export default withStyles(styles)(RootCompose);
