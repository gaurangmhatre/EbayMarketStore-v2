/**

 */
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var mongo = require('./mongo');
//var MongoClient = require('mongodb').MongoClient;

var loginDatabase = "mongodb://localhost:27017/ebay";

module.exports = function(passport) {
    passport.use('login', new LocalStrategy(function(username, password, done) {

        mongo.connect(loginDatabase, function(connection) {

            var loginCollection = mongo.collection('users', connection);

            var whereParams = {
                EmailId: username,
                Password:password
            }

            process.nextTick(function(){
                loginCollection.findOne(whereParams, function(error, user) {

                    if(error) {
                        return done(err);
                    }

                    if(!user) {
                        return done(null, false);
                    }

                    if(user.Password != password) {
                        done(null, false);
                    }

                    connection.close();
                    console.log(user.EmailId);
                    done(null, user);
                });
            });
        });
    }));


   /* passport.use('login', new LocalStrategy(function(username, password, done) {
        mongo.connect(loginDatabase, function(connection) {

            var loginCollection = mongo.connectToCollection('login', connection);
            var whereParams = {
                EmailId:username,
                password:password
            }

            process.nextTick(function(){
                loginCollection.findOne(whereParams, function(error, user) {

                    if(error) {
                        return done(err);
                    }

                    if(!user) {
                        return done(null, false);
                    }

                    if(user.password != password) {
                        done(null, false);
                    }

                    connection.close();
                    console.log(user.EmailId);
                    done(null, user);
                });
            });
        });
    }));*/
}


