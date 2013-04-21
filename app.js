
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , bitlyClient = require('bitly2')
  , request = require('request')
  , async = require('async')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', function(req, res) {
  tweets = []
  bitly = new bitlyClient('user', 'pwd', function(error) {
    bitly.get('realtime/hot_phrases', function(error, result) {
      phrases = result.data.phrases
      async.each(phrases, function(phrase, cb) {
        query = 'http://search.twitter.com/search.json?q=' + phrase.phrase
        request.get(query, function(error, response, body) {
          entries = JSON.parse(body)
          async.each(entries.results, function(tweet, callback) {
            tweets.push({'user':tweet.from_user, 'tweet': tweet.text, 'retweets': tweet.metadata.recentretweets})
            callback()
          }, function(){
            cb()
          })
        })
      }, function() {
          res.render('index', {'tweets': tweets})        
      })
    })
  })
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
