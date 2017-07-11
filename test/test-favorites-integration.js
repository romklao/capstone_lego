const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const passport = require('passport');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {User} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);



// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

function seedUserData() {
    console.info('seeding user data');
    const seedData = {
            username: 'tester',
            email: 'test@gmail.com',
            password: '1234',
            favorites: [
                {set_num: '21013-1'}, 
                {set_num: '10252-1'}
            ]
        };
    return User.insert(seedData);
}

describe('users API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });


  describe('POST user endpoint', function() {

    it('should add a new user', function() {

        const newUser = {
            username: 'tester', 
            password: '1234', 
            email: 'test@gmail.com'
            }

        return chai.request(app)
            .post('/signup')
            .send(newUser)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'username', 'email');
                res.body.id.should.not.be.null;
                res.body.username.should.equal(newUser.username);
                res.body.email.should.equal(newUser.email);

                return User.findById(res.body.id).exec();
            })
            .then(function(user) {
                user.username.should.equal(newUser.username);
                user.email.should.equal(newUser.email);
            });
    });
  });

    it('should fail with invalid user', done => {

        const newUser = {
            username: 'tester', 
            password: '1234', 
            email: 'test@gmail.com'
        }

        chai.request(app)
            .post('/login')
            .auth(newUser.username, newUser.password)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                done();
            });
    });


    it('should allow a new user to login', done => {
        const newUser = {
            username: 'tester', 
            password: '1234', 
            email: 'test@gmail.com'
        }

        chai.request(app)
            .post('/signup')
            .send(newUser)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'username', 'email');
                res.body.id.should.not.be.null;
                res.body.username.should.equal(newUser.username);
                res.body.email.should.equal(newUser.email);

                return User.findById(res.body.id).exec();
            })
            .then(function(user) {
                chai.request(app)
                .post('/login')
                .auth(newUser.username, newUser.password)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
            })
            
    });


//   describe('DELETE endpoint', function() {

//     it('should delete a favorite by id', function() {

//         let favorite;

//         return Favorite
//             .findOne()
//             .exec()
//             .then(_favorite => {
//                 favorite = _favorite;
//                 return chai.request(app).delete(`/favorites/${favorite.id}`);
//             })
//             .then(res => {
//                 res.should.have.status(204);
//                 return Favorite.findById(favorite.id);
//             })
//             .then(_favorite => {
//                 should.not.exist(_favorite);
//             });
//     });
//   });
});










