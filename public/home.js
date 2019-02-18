console.info('started server lisner');
const socket = io('/');
socket.on('tweets', function (tweet) {
    console.log('tweet',tweet);
    tweetHtml = loadimage(tweet)
    $('#tweet-container').prepend(tweetHtml);
});

function loadimage(tweet) {
    imageLinks =''
    if(tweet.entities.media!=undefined) {
        tweet.entities.media.forEach(image => {
            imageLinks += `<a href="${tweet.entities.media[0].media_url}:large" target="_blank"><img src="${tweet.entities.media[0].media_url}:thumb" class="avatar pull-right"/></a>`
        });
        
    }
    return imageLinks;
}