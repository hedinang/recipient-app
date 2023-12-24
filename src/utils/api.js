import { create } from 'apisauce';
import { getCookie } from './cookie';

const instance = create({ baseURL: process.env.REACT_APP_API_ROOT, withCredentials: true });

instance.axiosInstance.interceptors.request.use(function (config) {
  const token = getCookie('axl_shipment_token');
  config.headers['Authorization'] = `TToken AXL_${token}`;

  return config;
});

export const updateLocations = (trackingCode, shipmentID, data) => instance.post(`delivery/${trackingCode}/${shipmentID}/update-locations`, data);
export const updateQuestionnaire = (trackingCode, shipmentID, data) => instance.post(`delivery/${trackingCode}/${shipmentID}/update-questionnaire`, data);
export const getDropoffPosition = (addressType) => instance.get(`delivery/${addressType}/get-drop-off-position`);

export default instance;
