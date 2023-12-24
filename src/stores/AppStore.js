import { create } from 'apisauce';
import Sockette from 'sockette';
import { action, decorate, observable } from 'mobx';
import DeliveryStore from './DeliveryStore';
import PODStore from './podStore';
import { defaultTheme } from '../themes';
import { getCookie } from 'utils/cookie';

class AppStore {
  constructor() {
    this.api = create({
      baseURL: process.env.REACT_APP_API_ROOT,
      withCredentials: true,
    });

    this.api.axiosInstance.interceptors.request.use(function (config) {
      const token = getCookie('axl_shipment_token');
      if (token && !config.headers['Authorization']) config.headers['Authorization'] = `TToken AXL_${token}`;

      return config;
    });

    this.deliveryStore = new DeliveryStore(this);
    this.podStore = new PODStore(this);
  }

  pageTheme = defaultTheme;
  driverEvent = null;

  connectWS(trackingCode) {
    console.log('connecting');
    this.ws = new Sockette(`${process.env.REACT_APP_TRACKING_WS}?${trackingCode}`, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: (e) => {
        console.log('Websocket driver location tracking Connected');
        this.ws.json({ target: 'SUBSCRIBE', content: 'NEW_SOLUTION_' });
      },
      onmessage: (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!data.signal && data.geolocation) {
            this.driverEvent = data;
          }
        } catch (e) {
          console.log('e is: ', e);
        }
      },
      onreconnect: (e) => console.log('Reconnecting...', e),
      onmaximum: (e) => console.log('Stop Attempting!', e),
      onclose: (e) => console.log('Closed!', e),
      onerror: (e) => console.log('Error:', e),
    });
  }
}

decorate(AppStore, {
  connectWS: action,
  driverEvent: observable,
  pageTheme: observable,
});

export default AppStore;
