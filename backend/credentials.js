const {
  FSM_CLOUD_HOST, 
  FSM_ACCOUNT, 
  FSM_CLIENT_ID, 
  FSM_CLIENT_SECRET
} = process.env;

const client_credentials = {};

if (FSM_CLOUD_HOST && FSM_ACCOUNT && FSM_CLIENT_ID && FSM_CLIENT_SECRET) {
  client_credentials[FSM_CLOUD_HOST] = {};
  client_credentials[FSM_CLOUD_HOST][FSM_ACCOUNT] = {
    'client_id': FSM_CLIENT_ID,
    'client_secret': FSM_CLIENT_SECRET
  };
}
exports.client_credentials = client_credentials;