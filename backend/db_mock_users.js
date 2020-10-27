// Mocked API from backend framework to access user data model
// Store user on node session using users dictionnary.
// Export functions as commonjs syntax to be work with require()
// API is based on passportjs.org sample code : http://www.passportjs.org/docs/

const users = {};
const tokens = {};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function findOrCreate(user, callback) {
  const token = uuidv4();
  if (!users[user.uid]) {
    users[user.uid] = {
      id: user.uid,
      last_name: user.last_name,
      first_name: user.first_name,
      mail: user.mail
    };
  }
  
  tokens[token] = user.uid;
  callback(null, users[user.uid], token);
}

function findById(id, callback) {
  callback(null, users[id]);
}

function findByToken(token, callback) {
  if (tokens[token]) {
    callback(null, users[tokens[token]]);
  } else {
    callback('unknown token', false);
  }
}

exports.findOrCreate = findOrCreate;
exports.findById = findById;
exports.findByToken = findByToken;