const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    hbs = require('express-handlebars'),
    server = require('http').createServer(app),
    Twit = require('twit'),
    io 	= require('socket.io')(server),
    _ = require('lodash'),
    fs = require('fs'),
    request = require('request'),
    uplaodpath = 'public/downloads/'
app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
    res.render('home');
});

app.use(express.static('public'))

server.listen(port);

const twitter = new Twit({
    consumer_key: 'ClkspMmRMOTAJvysssMpylY56',
    consumer_secret: '34qxajeFKcPTvMocYT5xMdOTZrQohbOAO1btgpRihJuA1tGxlM',
    access_token: '138086873-jMTpMLwOTPKRRDQ9MnlgUvwIollZTadG3i9ZnRlz',
    access_token_secret: 'xFdxY1bV2aRaxvy5AJ16i7kCxsVNe6MzThTr5QgJxJzwJ'
});

wordsArray=[]

tags = [
    'news'
];

// Get the image directry name
function getDirName(tagString) {
    return tagString.toLowerCase().split(',')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join('');
}

// given uri  download image  and save loacal
function downloadImage(uri, pathName, fileName,callback){
  request.head(uri, function(err, res, body){
    const savePath = pathName + fileName;
    request(uri).pipe(fs.createWriteStream(savePath)).on('close', callback);
  });
};

// check dir is exisit
function makepath(dirpath) {
    newDir = uplaodpath+dirpath
    fs.mkdir(newDir, { recursive: true }, (err) => {
        console.log('err',err);
    });
    return newDir;
}

// get image url array form twitter
function getTwitterImageUri(tweet) {
    imageLinks =[]
    // check images are available
    if(tweet.entities.media!=undefined) {
        tweet.entities.media.forEach(image => {
            imageLinks.push(image.media_url);
        });        
    }
    return imageLinks;
}

// downlaod given image to loacal 
function downloadTwitterImages(tweet, tosavepath) {
    const _timStamp = Date.now()
    const imagesArr = getTwitterImageUri(tweet)
    imagesArr.forEach(imgUri => {
        const fileName = _timStamp +'_' + imgUri.split('/').pop()
        downloadImage(imgUri, tosavepath, fileName, function(){
        //   console.log('done');
        });
    });
}

function init() {
    tagString=tags.map((str)=>str.trim()).join(',');
    directryName = getDirName(tagString)+'/';
    newDirpath = makepath(directryName);
    
    console.log('newDirpath',newDirpath);
    const stream = twitter.stream('statuses/filter', { track:tagString } );

    io.on('connect', function(socket) {
        stream.on('tweet', function (tweet) {
            downloadTwitterImages(tweet, newDirpath);
            socket.emit('tweets', tweet);
        });
    });
}

init()