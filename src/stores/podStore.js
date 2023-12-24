import {observable, action, decorate} from 'mobx';
import _ from 'lodash';

class PODStore {
  constructor(appStore) {
    this.appStore = appStore;
  }
  isRequested = false;
  currentStep = 0;
  imagesPOD = [];
  isPODFeedback = false;
  isDisplayed = false;
  isChanged = false;
  isPreviewImage = false;

  updateCurrentStep(step) {
    this.currentStep = step;
  }

  setImagesPOD(images) {
    this.imagesPOD = images;
  }

  updateField(field, val) {
    this[field] = val;
  }
  updateIsRequested(value) {
    this.isRequested = value;
  }
}

decorate(PODStore, {
  currentStep: observable,
  isRequested: observable,
  imagesPOD: observable,
  updateCurrentStep: action,
  isPODFeedback: observable,
  isDisplayed: observable,
  isChanged: observable,
  updateField: action,
  isPreviewImage: observable,
});

export default PODStore;
