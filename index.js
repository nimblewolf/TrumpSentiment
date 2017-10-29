// import the modules
const express = require('express');
const path = require('path');
const sentiment = require('havenondemand');
const fs = require('fs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const Tweet = require('./models/tweets');

var app = express();
app.set('view engine', 'ejs');
var connected = false;
mongoose.connect('mongodb://Allan:password@ds235065.mlab.com:35065/cab432');
mongoose.connection.once('open', function(){
    console.log('Successfully connected to the database!!');
    connected = true;
}).on('error', function(error){
    console.log('Connection error: ', error);
});
var globalAverage = 0;
var globalSentiment;
var arrayTweets; //find() returns an array so this becomes an array later
var numberTweets;
var positiveTweet;
var negativeTweet;
var neutralTweet;
app.get('/', function(req, res){
    var numPositive =0;
    var numNeutral =0;
    var numNegative =0;
    //connect to mongodb
    if(connected){
        Tweet.find({}).then(function(result){
            arrayTweets= result;
            numberTweets = arrayTweets.length;
            console.log("arrayTweets.length is: "+numberTweets);
            arrayTweets.forEach(function(element){
                globalAverage += element.sentimentScore;
                if(element.sentiment == "positive")numPositive++;
                if(element.sentiment == "neutral")numNeutral++;
                if(element.sentiment == "negative")numNegative++;
            });
            globalAverage = globalAverage/numberTweets;
            if(globalAverage>0)globalSentiment = "positive";
            if(globalAverage<0)globalSentiment = "negative";
            if(globalAverage==0)globalSentiment = "neutral";
            var tempPositive = findPositive();
            var tempNegative = findNegative();
            var tempNeutral = findNeutral();
                positiveTweet = {
                    user : tempPositive.user,
                    tweet : tempPositive.tweet
                }
                negativeTweet = {
                    user : tempNegative.user,
                    tweet : tempNegative.tweet
                }
                neutralTweet = {
                    user : tempNeutral.user,
                    tweet : tempNeutral.tweet
                }
            res.render('index.ejs', {
                numTweets: numberTweets,
                overallSentiment: globalSentiment,
                positiveSentiments: numPositive,
                neutralSentiments: numNeutral,
                negativeSentiments: numNegative,
                pTweet : {tweet:positiveTweet.tweet, user:positiveTweet.user},
                nTweet: {tweet:negativeTweet.tweet, user:negativeTweet.user},
                neuTweet: {tweet:neutralTweet.tweet, user:neutralTweet.user}
            });
        });
    } else {
        res.sendfile(__dirname + '/loading.html');
    }
    
});
app.get('/style.css', function(req, res){
    res.sendFile(__dirname + '/style.css');
});

app.listen(3100, function () {
	console.log('Trump Sentiment listening...');
});

function findPositive(){
    var item;
    do{
        item = arrayTweets[Math.floor(Math.random()*arrayTweets.length)];
    } while(item.sentiment !== "positive");
    
    return item;
}
function findNegative(element){
    var item;
    do{
        item = arrayTweets[Math.floor(Math.random()*arrayTweets.length)];
    } while(item.sentiment !== "negative");
    
    return item;
}

function findNeutral(element){
    var item;
    do{
        item = arrayTweets[Math.floor(Math.random()*arrayTweets.length)];
    } while(item.sentiment !== "neutral");
    
    return item;
}