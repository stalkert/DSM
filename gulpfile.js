/**
 * Created by max on 19.03.16.
 */

var gulp        = require('gulp'),
    download    = require('gulp-download'),
    rename      = require('gulp-rename'),
    fs          = require('fs'),
    querystring = require('querystring'),
    http        = require('http');

var settings;
var configfile = 'ovoconfig.json';

gulp.task('default',['init','download-all'],function() {
    console.log("Files downloaded! Use 'watch-all' task to auto update");
});

gulp.task('watch-all',['init'],function() {
    gulp.watch('*/*.html',['push-all']);
    gulp.watch('*/*.js',['push-all']);
    gulp.watch('*/*.css',['push-all']);

    gulp.watch('main.css',['push-all']);
    gulp.watch('main.js',['push-all']);
});

gulp.task('download-all',['init'],function(){
    // downloading main js and css
    if (settings.use_common) ['css','js'].forEach(function(extention){
        download(get_req(extention))
            .pipe(rename('main.'+extention))
            .pipe(gulp.dest("."));
    });

    // downloading all pages, from settings.page_urls
    settings.page_urls.forEach(function(pageUrl) {
        ['css','js','html'].forEach(function(extention) {
            download(get_req(extention,pageUrl))
                .pipe(rename((pageUrl == '/' ? 'main' : pageUrl) + '.' + extention))
                .pipe(gulp.dest((pageUrl =='/' ? 'main' : pageUrl) + "/"));
        })
    })
});

gulp.task('push-all', ['init'],function() {
    //push main js and css
    // delete 'css'
    if (settings.use_common) ['js'].forEach(function(extention) {
    // if (settings.use_common) ['css','js'].forEach(function(extention) {
        var filename = 'main.'+extention;
        if (fs.existsSync(filename)) {
            var data = fs.readFileSync(filename, 'utf-8');
            postToServer(data,extention);
        }
    });

    //push page html, css and js
    settings.page_urls.forEach(function(pageUrl) {
        // delete 'css'
        ['js','html'].forEach(function(extention) {
        // ['css','js','html'].forEach(function(extention) {
            var filename = (pageUrl =='/' ? 'main' : pageUrl) + '/'
                + (pageUrl =='/' ? 'main' : pageUrl) + '.'+extention;

            if (fs.existsSync(filename)) {
                console.log("sending file " + filename);
                var data = fs.readFileSync(filename, 'utf-8');
                postToServer(data,extention, pageUrl);
            } else console.log("file " + filename + " not found");
        })
    })
});

gulp.task('init', function() {
    if (!fs.existsSync(configfile)) throw new Error ("no config file");
    if (settings == undefined) {
        settings = JSON.parse(fs.readFileSync(configfile, 'utf-8'));
        console.log(settings);
    }
});



function get_req(what, page_url) {
    var str = 'http://api.ovobox.com/get_site_content?';
    str+= [
        "phone="    + settings.phone,
        "password=" + settings.password,
        "domain="  + settings.domain,
        "what="     + what,
    ].join('&');

    if (page_url) str+= "&page_url=" + encodeURIComponent(page_url);

    return str;
}

function postToServer(data, what, pageUrl) {
    if (!data || data == '') return;
    // Build the post string from an object
    var post_data = querystring.stringify({
        'phone':settings.phone,
        'password':settings.password,
        'domain':settings.domain,
        'what':what,
        'data':data,
        'page_url':pageUrl
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: 'api.ovobox.com',
        port: '80',
        path: '/put_site_content',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Error: ' + chunk);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

}