'use strict'

const bodyParser = require('body-parser');
const urlParser = bodyParser.urlencoded({
    extended: true
});
const jsonParser = bodyParser.json();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const mongo = require('mongo');
const {BasicStrategy} = require('passport-http')
const passport = require('passport');
const logout = require('express-passport-logout');
const router = express.Router();
const {User} = require('./models');
const {PORT, DATABASE_URL, REBRICKABLE_KEY} = require('./config');

const app = express();

mongoose.Promise = global.Promise;

app.use(jsonParser);
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/sweetalert-master'));

const http = require("http");

setInterval(function() {
    http.get("http://<your app name>.herokuapp.com");
}, 300000); // every 5 minutes (300000)

///////// Rebrickable API imported packages ////////

const Es6Promise = require('es6-promise').polyfill();
const IsomorphicFetch = require('isomorphic-fetch');


// When name routes, we have to name them differently. 
// For example, sets/:id, sets/favorites this will not work when we req or res data
// since they are the same name. We should name for example sets/:id and another route can be /favorites
// Remember this!

//<------------------- Sign up, log in  and log out routes -------------------->//

app.post('/signup', (req, res) => {
    if (!req.body) {
    return res.status(400).json({message: 'No request body'});
    }
    let {username, password, email} = req.body;

    if (!(username)) {
    return res.status(422).json({message: 'Missing field: username'});
    }

    if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
    }

    username = username.trim();

    if (username === '') {
    return res.status(422).json({message: 'Missing field: username'});
    }

    if (!(email)) {
    return res.status(422).json({message: 'Missing field: email'});
    }

    if (typeof email !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: email'});
    }

    email = email.trim();

    if (email === '') {
    return res.status(422).json({message: 'Incorrect field length: email'});
    }

    if (!(password)) {
    return res.status(422).json({message: 'Missing field: password'});
    }

    if (typeof password !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: password'});
    }

    password = password.trim();

    if (password === '') {
    return res.status(422).json({message: 'Incorrect field length: password'});
    }

    // check for existing user
    return User
    .find({email})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          message: 'email already taken'
        });
        // return res.json({message: 'email already taken'});
      }
      // if no existing user, hash password
      return User.hashPassword(password)
    })
    .then(hash => {
      return User
        .create({
          username: username,
          password: hash,
          email: email
        })
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      if (err.message === 'email already taken') {
        res.status(422).json({message: err.message})
      }
        res.status(500).json({message: 'Internal server error'})
    });
});


//<------------- NB: at time of writing, passport uses callbacks, not promises -------------->//

const basicStrategy = new BasicStrategy(function(username, password, callback) {
  let user;

  User
    .findOne({ $or:[{'username': username}, {'email':username}] })
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user)
      }
    });
});

passport.use(basicStrategy);
app.use(passport.initialize());

app.post('/login',
  passport.authenticate(
    'basic',
    {session: false}),
    (req, res) => res.json({user: req.user.apiRepr()})
);

app.get('/logout', logout());


//<--------------- Retrieve data from rebrickcable API by using GET request --------------->//

app.get('/sets/:id', function(req, res) {
   fetch('https://rebrickable.com/api/v3/lego/sets/'+ req.params.id + `/?key=${REBRICKABLE_KEY}&page=1`)
    .then(function(rebrickableResponse) {
        if (rebrickableResponse.status >= 400) {
            //throw new Error("Bad response from server");
            return null;
        }
        return rebrickableResponse.json();
    })
    .then(function(stories) {
        if (stories) {
            res.json(stories);
        } else {
            res.status(404).json({message: 'Item not found'})
        }
    });
})

app.get('/sets-search/:name', function(req, res) {
   fetch(`https://rebrickable.com/api/v3/lego/sets/?key=${REBRICKABLE_KEY}&page=1&search=` + req.params.name)
    .then(function(rebrickableResponse) {
        if (rebrickableResponse.status >= 400) {
            throw new Error("Bad response from server");
        }
        return rebrickableResponse.json();
    })
    .then(function(stories) {
        res.json(stories)
    });
});

//<--------------- Add favorite lego sets by using POST request --------------->//

app.post('/favorites',
    passport.authenticate(
        'basic',
        {session: false}
    ),
    (req, res) => {
        User.findByIdAndUpdate(
            req.user._id,
            {$push: {"favorites": {set_num: req.body.set_num}}},
            {safe: true, upsert: true, new : true},
            function(err, model) {
              res.json(req.user.favorites);
            }
        );
    }
);

//<------------------ Get favorite list using get request ------------------>//

app.get('/favorites',
    passport.authenticate(
        'basic',
        {session: false}
    ),
    (req, res) => {
        res.json(req.user.favorites);
    }
);

//<------------------- Delete favorite item by id -------------------->//

app.delete('/favorites',
    passport.authenticate(
        'basic',
        {session: false}
    ),
    (req, res) => {

    User.findByIdAndUpdate(
        req.user._id,
        {$pull: {"favorites": {set_num: req.body.set_num}}},
        {safe: true, upsert: true, new : true},
        function(err, model) {
          res.json(req.user.favorites);
        });
});

//<----------------- Put it after all the routes otherwise it will crash --------------->//

app.use('*', function(req, res) {
  return res.status(404).json({message: 'Not Found'});
}); 

//<--------------- referenced by both runServer and closeServer. closeServer --------------->//
//<--------------- assumes runServer has run and set `server` to a server object ------------>//

let server;

function runServer(databaseUrl) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

























