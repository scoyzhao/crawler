'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var baseUrl = 'http://www.imooc.com/learn/';
var videoIds = [348, 637, 259, 75, 197, 728, 134];
var fetchCourseArray = [];

function filterChapters(html) {
    var $ = _cheerio2.default.load(html);
    var chapters = $('.chapter');
    var courseTitle = $('.path').find('span').text();
    // 并没有写出来，而是通过后台js获取
    // let number = $('.js-learn-num').text();

    var courseData = {
        courseTitle: courseTitle,
        chaptersArr: []
    };
    // console.log(courseData.courseTitle);
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

        courseData.chaptersArr.push(chapterData);
    });

    return courseData;
};

function printData(coursesData) {
    coursesData.forEach(function (courseData) {
        var printMsg = '##### ' + courseData.courseTitle + ' #####\n';
        courseData.chaptersArr.forEach(function (chapter) {
            printMsg += chapter.chapterTitle + '\n';

            chapter.videos.forEach(function (video) {
                printMsg += '  [' + video.id + '] ' + video.title + ' ' + video.time + '\n';
            });
            printMsg += '\n';
        });

        console.log(printMsg);
    });
};

function getPageAsync(url) {
    return new _bluebird2.default(function (resolve, reject) {
        console.log('\n\u6B63\u5728\u722C\u53D6 ' + url);

        _http2.default.get(url, function (res) {
            var html = '';

            res.on('data', function (data) {
                html += data;
            });
            res.on('end', function () {
                resolve(html);
                // let courseData = filterChapters(html);
                // printData(courseData);
            });
        }).on('error', function (e) {
            reject(e);
            console.log('error');
        });
    });
};

videoIds.forEach(function (id) {
    fetchCourseArray.push(getPageAsync('' + baseUrl + id));
});

_bluebird2.default.all(fetchCourseArray).then(function (pages) {
    var coursesData = [];

    pages.forEach(function (html) {
        var courses = filterChapters(html);

        coursesData.push(courses);
    });

    // courseData.sort((a, b) => {
    //     return a.number < b.number;
    // });

    printData(coursesData);
}).catch(function (reason) {
    console.log(reason);
});
