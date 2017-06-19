'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var url = 'http://www.imooc.com/learn/348';

function filterChapters(html) {
    var $ = _cheerio2.default.load(html);
    var chapters = $('.chapter');

    var courseData = [];
    chapters.each(function (item) {
        var chapter = $(this);
        // 这句具体理解一下，很关键。。。。
        var chapterTitle = chapter.find('strong').contents().filter(function () {
            return this.nodeType == 3;
        }).text().trim();
        var videos = chapter.find('.video').children('li');
        var chapterData = {
            chapterTitle: chapterTitle,
            videos: []
        };

        videos.each(function (item) {
            var video = $(this).find('.J-media-item');
            var videoTitles = video.contents().filter(function () {
                return this.nodeType == 3;
            }).text().trim().split('\n');
            var id = video.attr('href').split('video/')[1];

            chapterData.videos.push({
                title: videoTitles[0].trim(),
                time: videoTitles[1].trim(),
                id: id
            });
        });

        courseData.push(chapterData);
    });

    return courseData;
}

function printData(courseData) {
    var printMsg = '\n';
    courseData.forEach(function (chapter) {
        printMsg += chapter.chapterTitle + '\n';

        chapter.videos.forEach(function (video) {
            printMsg += '  [' + video.id + '] ' + video.title + ' ' + video.time + '\n';
        });
        printMsg += '\n';
    });

    console.log(printMsg);
}

_http2.default.get(url, function (res) {
    var html = '';

    res.on('data', function (data) {
        html += data;
    });
    res.on('end', function () {
        var courseData = filterChapters(html);
        printData(courseData);
    });
}).on('error', function () {
    console.log('error');
});
