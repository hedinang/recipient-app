import { atom } from 'recoil';

export const accessCodeFormState = atom({
  key: 'access_codes',
  default: {
    invalid: false,
    access_codes: [{ type: '', value: '' }],
    errors: [],
  },
});
