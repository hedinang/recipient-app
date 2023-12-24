import React from 'react';
import { Provider } from 'mobx-react';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AppStore from './stores/AppStore';

import AppContainer from './containers';
import './App.css';

document.title = 'AxleHire Tracking';

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <Provider store={new AppStore()}>
          <AppContainer />
          <ToastContainer />
        </Provider>
      </RecoilRoot>
    </div>
  );
}

export default App;
