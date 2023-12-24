import {observable, action, decorate, computed} from 'mobx';
import _ from 'lodash';
import {getCookie, setCookie} from "../utils/cookie";
import Sockette from 'sockette';
import { defaultTheme, airShop, jlux } from '../themes';

class DeliveryStore {
  constructor(appStore) {
    this.appStore = appStore;
  }

  isOpenPreferredPhoto = false;
  isSubmittedFeedback = false;
  driverEvent = null;
  trackingCode = null;
  deliveries = [];
  delivery = null;
  settings = null;
  code = null;
  token = null;
  tokenRemainingTime = 0;
  verifyingCode = false;
  codeVerified = null;
  verificationMethod = 'sms';
  methodVerifyInput = '';
  dialogLoading = false;
  dialogOpened = false;
  editDialogOpened = false;
  exitSessionDialog = false;
  dialogErrorMsg = '';
  step = 1;
  editedDeliveryData = {};
  countdownTimer = null;
  feedback = {};
  packageLocation = null;
  addonServices = {};
  loadingDelivery = false;
  tipDialogOpened = false;
  isTipped = false;
  tipping = {
    "currency": "usd",
  };
  pageTheme = defaultTheme;
  checkedTheme = false;
  accessCodeTypes = undefined;
  addressType = undefined;
  addressTypes = undefined;
  dropoffPositions = {};
  hideCompanyBranding = false;
  lastStep = false;

  getDelivery(trackingCode, callback) {
    this.loadingDelivery = true;
    let url = `/delivery/${trackingCode}`;
    if (!!this.token) {
      url = `/delivery/${trackingCode}/verified`;
    }

    this.appStore.api.get(
      url, {},
      {headers: {"Authorization": `TToken AXL_${this.token}`}}
    ).then(response => {
      if (response.status === 200) {
        this.trackingCode = trackingCode;
        this.delivery = response.data;

        if (!!this.delivery.shipment.customer) {
          if (!this.delivery.shipment.customer.phone_number && !!this.delivery.shipment.customer.email) {
            this.verificationMethod = 'email';
          } else if (!this.delivery.shipment.customer.phone_number && !this.delivery.shipment.customer.email) {
            this.verificationMethod = null;
          }
        } else {
          this.verificationMethod = null;
        }

        if (this.delivery.location) {
          this.driverEvent = {
            geolocation: {
              latitude: this.delivery.location.latitude,
              longitude: this.delivery.location.longitude,
            }
          }
        }

        if (this.delivery.settings) {
          this.settings = _.extend(_.clone(this.settings), this.delivery.settings);
          if (this.settings) {
            if (this.settings.client_theme && this.settings.client_theme === "airShop" && !this.checkedClientTheme){
               this.pageTheme = airShop;
               this.checkedClientTheme = true;
            }
            if (this.settings.brand_theme && !this.checkedClientTheme){
              const brandTheme = this.settings.brand_theme.split(",");
              const customerProfile = this.delivery.shipment.client_profile_id;
              for (let brand of brandTheme){
                const finalTheme = brand.split(":");
                if (customerProfile === 185 && finalTheme[0] === customerProfile.toString()){
                  this.pageTheme = jlux;
                }
              }

               this.checkedClientTheme = true;
            }
            if (this.settings.hide_company_branding && this.settings.hide_company_branding === "true"){
                           this.hideCompanyBranding = true;

            }
          }
        }
      }

      /**
       * @name window.gtag
       * @global
       * @function
       */
      if (this.delivery && !this.gtagTrackEventSubmitted && typeof window.gtag === 'function') {
        window.gtag('event', 'axl_track_delivery', {
          'client': this.delivery.client?.company,
          'status': this.delivery.shipment?.status,
          'signature_required': this.delivery.shipment?.signature_required,
          'id_required': this.delivery.shipment?.id_required,
          'timezone': this.delivery.shipment?.timezone
        })
        this.gtagTrackEventSubmitted = true
      }

      if (callback) callback(response);
      this.loadingDelivery = false;
    });
  }

  listDeliveries(trackingCodes, callback) {
    this.loadingDelivery = true;
    this.appStore.api.get(`/delivery/list`, {codes: trackingCodes}).then(res => {
      if (res.status === 200) {
        const settings = res.data && res.data.length ? res.data[0].settings : {};
        this.deliveries = res.data;
        this.settings = _.extend(_.clone(this.settings), settings);
      }
      if (callback) callback(res);
      this.loadingDelivery = false;
    });
  }

  getSettings(trackingCode) {
    this.appStore.api.get(`/delivery/${trackingCode}/settings`)
      .then(response => {
        if (response.status === 200) {
          this.settings = _.extend(_.clone(this.settings), response.data);
        }
      })
  }

  setMethodVerifyInput(value) {
    this.dialogErrorMsg = '';
    this.methodVerifyInput = value;
  }

  requestCode(callback) {
    if (!this.verificationMethod) return;

    // if (!this.methodVerifyInput.trim()) {
    //   this.dialogErrorMsg = 'Please fill the field to verify!';
    //   return false;
    // }

    this.dialogLoading = true;
    this.dialogErrorMsg = '';
    this.code = null;
    this.codeVerified = null;
    this.appStore.api.post(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/code?type=${this.verificationMethod}`).then(response => {
      if (response.ok) {
        const {generated} = response.data;
        if (generated) {
          if (callback) callback(response.data);
        } else {
          this.dialogErrorMsg = 'ERROR while requesting code. Please try again later!';
        }
      } else {
        if (response.status === 412) {
          this.dialogErrorMsg = 'Your provided information does not match!';
        } else {
          this.dialogErrorMsg = 'ERROR while requesting code. Please try again later!';
        }
      }
      this.dialogLoading = false;
    });
  }

  verifyCode(callback) {
    this.verifyingCode = true;
    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/verify-code?code=${this.code}`).then(response => {
      if (response.ok) {
        const {verified, expired} = response.data;
        this.codeVerified = verified;
        if (expired) {
          this.codeVerified = false;
          this.dialogErrorMsg = 'This code has been expired!';
        }
        if (callback) callback(verified);
      } else {
        this.codeVerified = false;
      }
      this.verifyingCode = false;
    });
  }

  inputtingCode(value) {
    this.codeVerified = null;
    this.dialogErrorMsg = '';
    this.code = value;
  }

  requestToken(code, callback) {
    this.appStore.api.post(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/${code}/token`).then(response => {
      if (response.ok) {
        this.token = response.data;
        if (callback) callback(response);
      }
    });
  }

  getTokenInfo(tokenId, callback) {
    this.dialogLoading = true;
    this.appStore.api.get(`/delivery/token/${tokenId}`).then(response => {
      if (response.ok) {
        const token = response.data;
        const tokenEndTime = token.created + token.ttl;
        const currentTime = Date.now();

        this.token = response.data.id;
        this.tokenRemainingTime = Math.floor((tokenEndTime - currentTime) / 1000);

        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.countdownTimer = setInterval(() => {
          this.tokenRemainingTime -= 1;
          if (this.tokenRemainingTime === 0) {
            clearInterval(this.countdownTimer);
          }
        }, 1000);
        // if (callback) callback(response);
      }
      this.dialogLoading = false;
      if (callback) callback(response);
    });
  }

  getEditedDeliveryData(callback) {
    if (!this.delivery || !this.delivery.shipment) return false;

    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/edit`).then(response => {
      if (response.status === 200) {
        this.editedDeliveryData = response.data || {};
        if (callback) callback(response);
      }
    });
  }

  getAccessCodeData(callback) {
    if (!this.delivery || !this.delivery.shipment) return;

    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/get-access-code-info`, null, { headers: { "Authorization": `TToken AXL_${this.token}` } }).then((response) => {
      if (response.status === 200) {
        this.editedDeliveryData = response.data || {};
      }

      if (typeof callback === 'function') callback(response);
    });
  }

  getEditedDeliveryField(field) {
    return _.get(this.editedDeliveryData, field);
  }

  setEditedDeliveryField(field, value) {
    _.set(this.editedDeliveryData, field, value);
  }

  saveEditedDelivery(callback) {
    if (!this.delivery.shipment || !this.tokenRemainingTime) return false;

    this.setEditedDeliveryField('shipment_id', this.delivery.shipment.id);
    this.appStore.api.post(
      `/delivery/${this.trackingCode}/${this.delivery.shipment.id}/edit`,
      this.editedDeliveryData,
      {headers: {"Authorization": `TToken AXL_${this.token}`}}
    ).then(response => {
      if (response.ok) {
        if (callback) callback(response);
      } else {
        this.dialogErrorMsg = 'ERROR while saving your request. Please try again later!';
      }
    });
  }

  signing = false;

  sign(base64, token) {
    let t = token;
    if (!token || token.trim() === "") {
      t = this.token;
    }

    return this.appStore.api.post(
      `/delivery/${this.trackingCode}/${this.delivery.shipment.id}/signature`,
      {data: base64},
      {headers: {"Authorization": `TToken AXL_${t}`}}
    );
  }

  isAllowScanId(trackingCode, token) {
    let t = token;
    if (!token || token.trim() === "") {
      t = this.token;
    }


    return this.appStore.api.get(
      `/delivery/${trackingCode}/id-scan`, {},
      {headers: {"Authorization": `TToken AXL_${t}`}}
    );
  }

  notifyID(data, trackingCode, shipmentId, token) {
    let t = token;
    if (!token || token.trim() === "") {
      t = this.token;
    }

    return this.appStore.api.post(
      `/delivery/${trackingCode}/${shipmentId}/id-scan`,
      {data: data},
      {headers: {"Authorization": `TToken AXL_${t}`}}
    );
  }

  validateSignatureToken(token) {
    let t = token;
    if (!token || token.trim() === "") {
      t = this.token;
    }

    console.log('this.token is: ', this.token);

    return this.appStore.api.get(
      `/delivery/${this.trackingCode}/${this.delivery.shipment.id}/signature`, {},
      {headers: {"Authorization": `TToken AXL_${t}`}}
    );
  }

  setFeedbackField(field, value) {
    return _.set(this.feedback, field, value);
  }

  getFeedback(callback) {
    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess) return false;

    this.dialogLoading = true;
    this.feedback = {};
    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/feedback/${latestDropoffSuccess.stop_id}`).then(response => {
      if (response.ok) {
        this.feedback = response.data;
        if (callback) callback(response);
      }
      this.dialogLoading = false;
    });
  }

  submitFeedback(callback) {
    if (!this.feedback.stop_id) return false;
    if (!this.delivery) return false;

    // this.dialogLoading = true;
    this.appStore.api.post(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/feedback/${this.feedback.stop_id}`, this.feedback).then(response => {
      if (callback) callback(response);
      if (!response.ok) {
        this.dialogErrorMsg = (response.data && response.data.errors) || 'ERROR while submitting your feedback. Please try again later!';
      }
      // this.dialogLoading = false;
    });
  }

  getAddonServices(callback) {
    if (!this.delivery || !this.delivery.shipment) return false;

    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/addon`).then(response => {
      if (response.ok) {
        if (response.data && response.data.length > 0) {
          this.addonServices = response.data;
        }
        if (callback) callback(response);
      }
    })
  }

  setVerificationMethod(value) {
    this.verificationMethod = value;
  }

  setStep(step) {
    this.step = step;
  }

  processNextStep(cb) {
    if (this.step === 1) {
      this.requestCode(res => this.setStep(2));
    } else if (this.step === 2) {
      if (this.codeVerified) {
        this.requestToken(this.code, (res) => {
          setCookie("axl_shipment_token", this.token, 1);
          this.setStep(3);
        });
      }
    } else if (this.step === 3) {
      this.closeDialog();
    } else if (this.step === 4) {
      // prepare data for submitting feedback
      const latestDropoffSuccess = this.getLatestDropoffSuccess();
      if (!latestDropoffSuccess) return false;

      this.setFeedbackField('stop_id', latestDropoffSuccess.stop_id);

      // submit feedback
      this.submitFeedback(cb);
    }
  }

  openDialog(step) {
    this.setStep(step || 1);
    this.dialogOpened = true;
  }

  closeDialog() {
    this.dialogLoading = false;
    this.dialogOpened = false;
    this.codeVerified = null;
    this.dialogErrorMsg = '';
  }

  openEditDialog(view) {
    this.editDialogOpened = view;
    this.dialogLoading = false;
  }

  closeEditDialog() {
    this.editDialogOpened = false;
    this.dialogLoading = false;
    this.dialogErrorMsg = '';
  }

  saveAndCloseDialog() {
    this.saveEditedDelivery(() => this.closeEditDialog())
  }

  openExitSessionDialog() {
    this.exitSessionDialog = true;
  }

  closeExitSessionDialog() {
    this.exitSessionDialog = false;
  }

  exitSession(callback) {
    this.token = null;
    this.tokenRemainingTime = 0;
    this.closeExitSessionDialog();

    setCookie("axl_shipment_token", '', 1);
    if (callback) callback();
  }

  openTipDialog() {
    this.tipDialogOpened = true;
  }

  closeTipDialog() {
    this.tipDialogOpened = false;
    this.dialogErrorMsg = '';
    this.tipping = {currency: 'usd'};
    this.closeDialog();
  }

  setTipField(field, value) {
    return _.set(this.tipping, field, value);
  }

  retrievePendingTip(callback) {
    if (!this.delivery) return false;

    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess || !latestDropoffSuccess.stop_id) return false;

    const stopId = latestDropoffSuccess.stop_id;
    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/tip/${stopId}`).then(response => {
      if (response.ok) {
        this.tipping = response.data;
        if (callback) callback(response.data);
      }
      this.dialogErrorMsg = '';
    });
  }

  retrieveSentTip(callback) {
    if (!this.delivery) return false;

    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess || !latestDropoffSuccess.stop_id) return false;

    const stopId = latestDropoffSuccess.stop_id;
    this.dialogLoading = true;
    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/tip/${stopId}/tipped`).then(response => {
      if (response.ok) {
        this.isTipped = true;
        if (callback) callback(response.data);
      }
      this.dialogLoading = false;
    });
  }

  cancelTipping() {
    if (!this.delivery) return false;

    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess || !latestDropoffSuccess.stop_id) return false;

    const stopId = latestDropoffSuccess.stop_id;
    this.dialogLoading = true;
    this.appStore.api.patch(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/tip/${stopId}`, this.tipping).then(response => {
      this.tipping = {currency: 'usd'};
      this.closeDialog();
      this.closeTipDialog();
      this.dialogLoading = false;
    });
  }

  triggerTipping(callback) {
    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess || !latestDropoffSuccess.stop_id) return false;

    if (!this.delivery) return false;

    const stopId = latestDropoffSuccess.stop_id;
    this.dialogLoading = true;
    this.appStore.api.post(
      `/delivery/${this.trackingCode}/${this.delivery.shipment.id}/tip/${stopId}/trigger`,
      this.tipping,
      {params: {service: "stripe"}}
    ).then(response => {
      if (response.ok) {
        this.tipping = response.data;
        this.dialogErrorMsg = '';
        if (callback) callback(response);
      } else {
        this.dialogErrorMsg = (response.data && response.data.errors) || 'ERROR while submitting your tip request. Please try again later!';
      }
      this.dialogLoading = false;
    });
  }

  confirmedTipping(callback) {
    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess || !latestDropoffSuccess.stop_id) return false;

    if (!this.delivery) return false;

    const stopId = latestDropoffSuccess.stop_id;
    this.dialogLoading = true;
    this.appStore.api.post(
      `/delivery/${this.trackingCode}/${this.delivery.shipment.id}/tip/${stopId}/confirmed`,
      this.tipping
    ).then(response => {
      if (response.ok) {
        this.dialogErrorMsg = '';
        if (callback) callback(response);
      } else {
        this.dialogErrorMsg = (response.data && response.data.errors) || 'ERROR while submitting your tip request. Please try again later!';
      }
      this.dialogLoading = false;
    });
  }

  sendReceiptEmail(request, callback) {
    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess || !latestDropoffSuccess.stop_id) return false;

    if (!this.delivery) return false;

    const stopId = latestDropoffSuccess.stop_id;
    this.dialogErrorMsg = '';
    this.appStore.api.post(
      `/delivery/${this.trackingCode}/${this.delivery.shipment.id}/receipt-email/${stopId}`,
      request
    ).then(response => {
      if (response.ok) {
        this.dialogErrorMsg = '';
      } else {
        this.dialogErrorMsg = (response.data && response.data.errors) || 'ERROR while sending receipt email. Please try again later!';
      }
      if (callback) callback(response);
    });
  }

  getPackageLocation(callback) {
    const latestDropoffSuccess = this.getLatestDropoffSuccess();
    if (!latestDropoffSuccess) return false;

    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/package-location/${latestDropoffSuccess.stop_id}`).then(response => {
      if (response.ok) {
        this.packageLocation = response.data;
        if (callback) callback(response);
      } else {
        this.packageLocation = null;
      }
    });
  }

  get tokenRemainingTimeString() {
    if (!this.tokenRemainingTime) return '0:00';

    const minutes = Math.floor(this.tokenRemainingTime / 60);
    let seconds = this.tokenRemainingTime % 60;
    if (seconds < 10) seconds = '0' + seconds;

    return minutes + ':' + seconds;
  }

  getLatestDropoffSuccess() {
    if (!this.delivery) return false;

    const {outbound_events} = this.delivery;
    const dropoffSuccessEvents = outbound_events.filter(e => e.signal === 'DROPOFF_SUCCEEDED');

    if (dropoffSuccessEvents.length === 0) {
      return false;
    }

    return dropoffSuccessEvents.shift();
  }

  getPOD(callback) {
    const lastDropoffSuccess = this.getLatestDropoffSuccess();
    const stop_id = lastDropoffSuccess.stop_id;
    if(!this.trackingCode || !this.delivery.shipment.id || !stop_id) return;
    const apiToken = this.token || getCookie('axl_shipment_token');
    if(!apiToken) return;
    this.appStore.api.get(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/pods/${stop_id}`, {}, {headers: {"Authorization": `TToken AXL_${apiToken}`}})
      .then(response => {
        if (response.ok) {
          if (callback) callback(response);
        }
      });
  }

  requestPOD() {
    const lastDropoffSuccess = this.getLatestDropoffSuccess();
    const stop_id = lastDropoffSuccess.stop_id;
    if(!this.trackingCode || !this.delivery.shipment.id || !stop_id) return;
    const apiToken = this.token || getCookie('axl_shipment_token');
    if(!apiToken) return;

    this.appStore.api.post(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/pods/${stop_id}/requests`, {}, {headers: {"Authorization": `TToken AXL_${apiToken}`}}).then(response => {
      if (response.ok) {
        console.log(response)
      }
    });
  }

  ratePOD(pod_id, thumb, callback) {
    if(!this.trackingCode || !this.delivery.shipment.id || !pod_id) return;
    const apiToken = this.token || getCookie('axl_shipment_token');
    if(!apiToken) return;

    const lastDropoffSuccess = this.getLatestDropoffSuccess();
    const stop_id = lastDropoffSuccess.stop_id;
    const shipmentImages = this.delivery.shipmentImageAnnotations;
    const stopShipment = shipmentImages.find(f => f.stop_id === stop_id);
    if(!stopShipment) return;

    this.appStore.api.put(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/pods/${stopShipment.id}/${pod_id}/rate`, thumb, {headers: {"Authorization": `TToken AXL_${apiToken}`}}).then(response => {
      if(callback) callback(response)
    });
  }

  // Web socket
  connectWS(trackingCode) {
    console.log('connecting');
    // this.ws = "";
    this.ws = new Sockette(`${process.env.REACT_APP_TRACKING_WS}?${trackingCode}`, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: e => {
        console.log('Websocket driver location tracking Connected');
        this.ws.json({target: 'SUBSCRIBE', content: 'NEW_SOLUTION_'});
      },
      onmessage: (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!data.signal && data.geolocation) {
            this.driverEvent = data;
          }
        } catch (e) {
          console.log('e is: ', e)
        }
      },
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => console.log('Closed!', e),
      onerror: e => console.log('Error:', e)
    });
  }
  setCodeVerified(){
    this.codeVerified = null;
  }

  markManageDeliveryOpened() {
    if (!this.delivery) return;

    const apiToken = this.token || getCookie('axl_shipment_token');
    this.appStore.api.post(`/delivery/${this.trackingCode}/${this.delivery.shipment.id}/opened`, null, { headers: {'Authorization': `TToken AXL_${apiToken}` }}).then((response) => {
      if (response.status === 401) this.token = null;
    });
  }

  setDialogErrorMsg(val) {
    this.dialogErrorMsg = val;
  }

  getAccessCodeTypes() {
    if (this.accessCodeTypes) return;

    this.appStore.api.get('delivery/get-access-code-types').then((response) => {
      if (response.status === 200) this.accessCodeTypes = response.data;
      if (response.status === 401) this.token = null;
    });
  }

  getAddressTypes() {
    if (this.addressTypes) return;

    this.appStore.api.get('delivery/get-address-type').then(async (response) => {
      if (response.status === 401) this.token = null;
      if (response.status !== 200) return;

      const data = response.data;
      this.addressTypes = data;
      const types = Object.keys(data);

      const res = await Promise.all(types.map((addressType) => this.appStore.api.get(`delivery/${addressType}/get-drop-off-position`)));
      const positions = res.map(({ data }) => data);
      this.dropoffPositions = _.merge({}, ...types.map((type, index) => ({ [type]: positions[index] })));
    });
  }

  setAddressType(type) {
    this.delivery['recipient-questionnaire'] = _.merge({}, this.delivery['recipient-questionnaire'], { address_type: type });
  }

  setAddressCharacteristic(params) {
    if (typeof this.delivery['recipient-questionnaire'] === 'object') this.delivery['recipient-questionnaire']['address_characteristic'] = params;
  }

  setDeliveryInstruction(instruction) {
    this.delivery.delivery_instruction = instruction;
  }

  setDeliveryReason(reason) {
    this.delivery['recipient-questionnaire'] = _.merge({}, this.delivery['recipient-questionnaire'], { delivery_reason: reason });
  }

  updateField(field, val) {
    this[field] = val;
  }
}

decorate(DeliveryStore, {
  delivery: observable,
  deliveries: observable,
  trackingCode: observable,
  settings: observable,
  feedback: observable,
  packageLocation: observable,
  code: observable,
  verifyingCode: observable,
  codeVerified: observable,
  methodVerifyInput: observable,
  token: observable,
  tokenRemainingTime: observable,
  step: observable,
  dialogLoading: observable,
  dialogOpened: observable,
  editDialogOpened: observable,
  exitSessionDialog: observable,
  dialogErrorMsg: observable,
  verificationMethod: observable,
  editedDeliveryData: observable,
  addonServices: observable,
  loadingDelivery: observable,
  signing: observable,
  tipDialogOpened: observable,
  isTipped: observable,
  tipping: observable,
  getDelivery: action,
  listDeliveries: action,
  getSettings: action,
  setMethodVerifyInput: action,
  requestCode: action,
  verifyCode: action,
  inputtingCode: action,
  requestToken: action,
  getTokenInfo: action,
  getEditedDeliveryData: action,
  getEditedDeliveryField: action,
  setEditedDeliveryField: action,
  saveEditedDelivery: action,
  setFeedbackField: action,
  getFeedback: action,
  submitFeedback: action,
  getAddonServices: action,
  setVerificationMethod: action,
  setStep: action,
  processNextStep: action,
  openDialog: action,
  closeDialog: action,
  openEditDialog: action,
  closeEditDialog: action,
  openExitSessionDialog: action,
  closeExitSessionDialog: action,
  exitSession: action,
  openTipDialog: action,
  closeTipDialog: action,
  setTipField: action,
  retrievePendingTip: action,
  retrieveSentTip: action,
  triggerTipping: action,
  getPackageLocation: action,
  tokenRemainingTimeString: computed,
  driverEvent: observable,
  setCodeVerified: action,
  getPOD: action,
  requestPOD: action,
  ratePOD: action,
  pageTheme: observable,
  markManageDeliveryOpened: action,
  setDialogErrorMsg: action,
  getAccessCodeTypes: action,
  accessCodeTypes: observable,
  addressType: observable,
  addressTypes: observable,
  getAddressTypes: action,
  dropoffPositions: observable,
  setAddressType: action,
  setAddressCharacteristic: action,
  setDeliveryReason: action,
  hideCompanyBranding: observable,
  updateField: action,
});

export default DeliveryStore;
