/**

 */
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var mongo = require('./mongo');
var mq_client = require('../rpc/client');
var bcrypt = require('./bCrypt.js');
//var MongoClient = require('mongodb').MongoClient;

var loginDatabase = "mongodb://localhost:27017/ebay";

module.exports = function(passport) {
    passport.use('login', new LocalStrategy(function(username, password, done) {

        mongo.connect(loginDatabase, function(connection) {

            var loginCollection = mongo.collection('users', connection);

            var msg_payload = {
                EmailId: username,
                Password:password
            }


            process.nextTick(function(){

                /**/
                mq_client.make_request('signin_queue',msg_payload, function(err,user){
/*
                    console.log(results.statusCode);
                    if(err){
                        throw err;
                    }
                    else			{
                        if(results.statusCode == 200){
                            console.log("removed ite from the cart.");
                            res.send(results.json_responses);
                        }
                        else {
                            console.log("Error! removing item from cart.");
                            res.send({"statusCode" : 401});
                        }
                    }
*/              
                    if(err) {
                        return done(err);
                    }

                    if(!user) {
                        return done(null, false);
                    }

                    //if(user.Password != password) {
                    if(!bcrypt.compareSync(password, user.Password)) {
                        done(null, false);
                    }

                    console.log("Inside Passport: "+user.EmailId);
                    done(null, user);

                });

                /**/

                /*loginCollection.findOne(whereParams, function(error, user) {

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
                });*/
                
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


