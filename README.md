# SSO Sample code

This repository shows a working code sample to fetch a user email on SAP IdP using [passportjs](http://www.passportjs.org/docs/oauth/).
It is still work in progress and currently subject to refactoring and code simplification

## Installation process

Within the `backend` folder run `npm install`.

## Environment variables

Create a `.env` file within `backend` folder with the following values :

```
IDP_CLIENT_ID=...
IDP_CLIENT_SECRET=...
IDP_URL_AUTHORIZE=https://<tenant>.accounts.ondemand.com/oauth2/authorize
IDP_URL_TOKEN=https://<tenant>.accounts.ondemand.com/oauth2/token
IDP_URL_CALLBACK=https://xyz.ngrok.io/auth/provider/callback
SESSION_SECRET=...
```

Current dev process works well with ngrok.com to access local instal from public domain.

## Run locally

Run `backend` using `npm start` from the backend folder. `frontend` folder is part of the dedfault code sample generator but not used yet in this example.
