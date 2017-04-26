const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {User, Favorite} = require('../models');
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

describe('favorites API resource', function() {

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


  describe('GET endpoint', function() {

    it('should return all existing favorites', function() {

        let res;
        return chai.request(app)
            .get('/favorites')
            .then(function(_res) {
                res = _res;
                res.should.have.status(200);
                res.body.favorites.should.have.length.of.at.least(1);
                return Favorite.count();
            })
            .then(count => {
                res.body.should.have.length.of(count);
            });

        it('should return favorites with right fields', function() {

            let resFavorite;
            return chai.request(app)
                .get('/favorites')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    res.body.should.have.length.of.at.least(1);

                    res.body.forEach(function(favorite) {
                        favorite.should.be.a('object');
                        favorite.should.include.keys('id', 'set_num');
                    });

                    resFavorite = res.body[0];
                    return Favorite.findById(resFavorite.id).exec();
                })
                .then(favorite => {
                    resFavorite.set_num.should.equal(favorite.set_num)
                });
        });
    });
  });

  describe('POST endpoint', function() {

    it('should add a new favorite', function() {

        const newFavorite = {
            set_num: faker.set_num
        };

        return chai.request(app)
            .post('/favorites')
            .send(newFavorite)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'set_num');
                res.body.id.should.not.be.null;
                res.body.set_num.should.equal(newFavorite.set_num);
                return Favorite.findById(res.body.id).exec();
            })
            .then(function(favorite) {
                favorite.set_num.should.equal(newFavorite.set_num);
            });
    });
  });

  describe('DELETE endpoint', function() {

    it('should delete a favorite by id', function() {

        let favorite;

        return Favorite
            .findOne()
            .exec()
            .then(_favorite => {
                favorite = _favorite;
                return chai.request(app).delete(`/favorites/${favorite.id}`);
            })
            .then(res => {
                res.should.have.status(204);
                return Favorite.findById(favorite.id);
            })
            .then(_favorite => {
                should.not.exist(_favorite);
            });
    });
  });
});










