var request = require('request')
    , express = require('express')
    ,assert = require('chai').assert
    ,http = require("http");


describe('http tests  LAB2 : MongoDB and RabbitMQ', function(){


    it('should be able to login with correct details', function(done) {
        request.post(
            'http://localhost:3000/checklogin',
            { form: { email: 'gaurangmhatre@gmail.com',password:'aabc' } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });
    
    it('Check Email Id exists', function(done) {
        request.post(
            'http://localhost:3000/checksignup',
            { form: { email: 'gaurangmhatre@gmail.com'} },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });

    it('Check Email Id exists with connection Pool', function(done) {
        request.post(
            'http://localhost:3000/checksignupWithConnectionPool',
            { form: { email: 'gaurangmhatre@gmail.com' } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });

    it('Check Email Id exists without RabbitMQ', function(done) {
        request.post(
            'http://localhost:3000/checksignupWithoutRabbitMQ',
            { form: { email: 'gaurangmhatre@gmail.com' } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });

    it('Check sign out', function(done) {
        request.post(
            'http://localhost:3000/signout',
            { form: { } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });

    it('Check get All products', function(done) {
        request.post(
            'http://localhost:3000/getAllProducts',
            { form: { } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });

    it('Check get All products types', function(done) {
        request.post(
            'http://localhost:3000/getAllProductsForAuction',
            { form: { } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });

});


