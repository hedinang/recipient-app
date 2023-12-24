import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

const rumApplicationId = process.env.REACT_APP_RUM_APPLICATION_ID;
const rumClientToken = process.env.REACT_APP_RUM_CLIENT_TOKEN;

if (rumApplicationId && rumClientToken) {
    datadogRum.init({
        applicationId: rumApplicationId,
        clientToken: rumClientToken,
        site: 'datadoghq.com',
        service:'recipient-app',
        env: process.env.REACT_APP_RUM_ENV,
        version: process.env.REACT_APP_RUM_VERSION,
        sessionSampleRate: 10,
        sessionReplaySampleRate: 100,
        trackUserInteractions: true,
        trackResources: true,
        trackFrustrations: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
        allowedTracingUrls: [/https:\/\/.*\.axlehire\.com/],
        enableExperimentalFeatures: ['clickmap']
    });
    datadogRum.startSessionReplayRecording();

    datadogLogs.init({
      clientToken: rumClientToken,
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    })
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
