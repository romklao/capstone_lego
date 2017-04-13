
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const {BasicStrategy} = require('passport-http')
const passport = require('passport');

const router = express.Router();
const {User} = require('./models');
const {PORT, DATABASE_URL} = require('./config');

const app = express();

mongoose.Promise = global.Promise;

app.use(jsonParser);

app.use(morgan('common'));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.use('*', function(req, res) {
  return res.status(404).json({message: 'Not Found'});
});

const Es6Promise = require('es6-promise').polyfill();
const IsomorphicFetch = require('isomorphic-fetch');

const Client = require('bricklink-api').Client;
const ItemType = require('bricklink-api').ItemType;
const bricklink = new Client({
    "consumer_key": "682B077BDC2C45EDA06A5BF16C441BE0",
    "consumer_secret": "7398EA62A3DB4637A2F094D638A0FB34",
    "token": "7E396EA3BE8E426C9C7FC0108A803A26",
    "token_secret": "B7C64E7A40654C71B885B27879A5BD69"
  });

const strategy = new BasicStrategy(
    (username, password, cb) => {
        User
            .findOne({username})
            .exec()
            .then(user => {
                if (!user) {
                    return cb(null, false, {
                        message: 'Incorrect username'
                    });
                }
                if (user.password !== password) {
                    return cb(null, false, 'Incorrect password');
                }
                return cb(null, user);
            })
            .catch(err => cb(err))
});

passport.use(strategy);

router.post('/', (req, res) => {
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }

    if (!('username' in req.body)) {
        return res.status(422).json({message: 'Missing field: username'});
    }

    let {username, password, email} = req.body;

    if (typeof username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }

    username = username.trim();

    if (username === '') {
        return res.status(422).json({message: 'Incorrect field length: username'});
    }

    password = password.trim();

    if (password === '') {
        return res.status(422).json({message: 'Incorrect field length: password'});
    }

    // check for existing user
    return User
        .find({username})
        .count()
        .exec()
        .then(count => {
            if (count > 0) {
                return res.status(422).json({message: 'username already taken'});
            }
            // if no existing user, hash password
            return User.hashPassword(password)
        })
        .then(hash => {
            return User
                .create({
                    username: username,
                    password: hash,
                    emailAddress: emailAddress
                })
        })
        .then(user => {
            return res.status(201).json(user.apiRepr());
        })
        .catch(err => {
            res.status(500).json({message: 'Internal server error'})
        });

});

// never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.


passport.use(BasicStrategy);
router.use(passport.initialize());

router.get('/me',
    passport.authenticate('basic', {session: false}),
    (req, res) => res.json({user: req.user.apiRepr()})
);



app.get('/sets/:id', function(req, res) {
   fetch('https://rebrickable.com/api/v3/lego/sets/'+ req.params.id +'/?key=f65e5ae6fb029b6e46e5b7096ae9de01&page=1')
    .then(function(rebrickableResponse) {
        if (rebrickableResponse.status >= 400) {
            throw new Error("Bad response from server");
        }
        return rebrickableResponse.json();
    })
    .then(function(stories) {
        res.json(stories);
    });
})

app.get('/sets-parts/:id', function(req, res) {
   fetch('https://rebrickable.com/api/v3/lego/sets/'+ req.params.id +'/parts/?key=f65e5ae6fb029b6e46e5b7096ae9de01&page=1')
    .then(function(rebrickableResponse) {
        if (rebrickableResponse.status >= 400) {
            throw new Error("Bad response from server");
        }
        return rebrickableResponse.json();
    })
    .then(function(stories) {
        res.json(stories);
    });
})

app.get('/sets-search/:name', function(req, res) {
   fetch('https://rebrickable.com/api/v3/lego/sets/?key=f65e5ae6fb029b6e46e5b7096ae9de01&page=1&search='+ req.params.name)
    .then(function(rebrickableResponse) {
        if (rebrickableResponse.status >= 400) {
            throw new Error("Bad response from server");
        }
        return rebrickableResponse.json();
    })
    .then(function(stories) {
        res.json(stories)
    });
    console.log('hi', req.params.name);
});

// app.get('/parts/:id', function(req, res) {
//    fetch('https://rebrickable.com/api/v3/lego/parts/' + req.params.id + '/?key=f65e5ae6fb029b6e46e5b7096ae9de01&page=1&search=')
//     .then(function(rebrickableResponse) {
//         if (rebrickableResponse.status >= 400) {
//             throw new Error("Bad response from server");
//         }
//         return rebrickableResponse.json();
//     })
//     .then(function(stories) {
//         res.json(stories)
//     });
//     console.log('hi', req.params.id);
// });

// app.get('/price/:id', function(req, res) {
//    bricklink.getPriceGuide('PART', req.params.id)
//   .then(function(part){
//     res.json(part)
//   })
// });
app.post('/posts', (req, res) => {
    const requiredFields = ['username', 'email', 'password'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    User 
        .create({
            username: request.body.username,
            email: request.body.email
        })
        .then(user => res.status(201).json(user.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong'});
        });
});

app.delete('/:id', (req, res) => {
    User
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(() => {
            console.log(`Deleted user with id ${req.params.ID}`);
            res.status(204).end();
        });
});

// referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
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
       console.log('Closing server');
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
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

























