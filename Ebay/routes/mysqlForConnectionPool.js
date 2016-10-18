/**
 * Created by Gaurang on 16-10-2016.
 */
var ejs = require('ejs');
var mysql = require('mysql');
var numberOfConnection = 500;
var cntn;
var cntnStack = [];
var cntnQueue = [];


var createConnectionPool = function(numberOfConnection){
    var conn;
    //console.log("creating my own connection");

    for(var count=0; count < numberOfConnection; count++){
        //console.log("creating my own connection");

        conn = mysql.createConnection({
            host : 'localhost',
            user : 'root',
            password : 'toor',
            database : 'ebay',
            port : 3306
        });

        cntnStack.push(conn);

    }
}

var getConnection = function(callback){
    console.log("inside getConnection logic!");

    if(cntnStack.length > 0){
        console.log("Length of cntnStack in getConnection before pop: "+ cntnStack.length)
        connection = cntnStack.pop();

        console.log("Length of cntnStack in getConnection after pop: "+ cntnStack.length)
        callback(null, connection);
    }
    else{
        console.log("Length of queue in getConnection method before push queue: "+ cntnQueue.length)
        cntnQueue.push(callback);
        console.log("Length of queue in getConnection method after push queue: "+ cntnQueue.length)
    }
}

setInterval(function(){
    console.log('inside setInterval')
    if(cntnStack.length > 0){
        if(cntnQueue.length > 0){
            console.log('removing the connection from the queue');
            callback = cntnQueue.shift();
            connection = cntnStack.pop();
            callback(null, connection);
        }
    }
}, 100000)


createConnectionPool(numberOfConnection);


exports.fetchData = function(callback, sqlQuery ) {

    console.log("Called function fetchData");
    console.log("\nSQL Query:" + sqlQuery);

    getConnection(function(err, connection) {

        connection.query(sqlQuery, function(err, result) {
            console.log("Execution the Query");
            if (err) {
                //console.log("ERROR: " + err.message);
                throw (err);
            }
            if (result) {
                console.log("Length of stack in code : "+ cntnStack.length)
                console.log("DB Results:" + result);
                connection.releaseConnection;
                cntnStack.push(connection);
                console.log("Length of stack in fetchData : "+ cntnStack.length)
                callback(err, result);
            }
        });
    });
}


