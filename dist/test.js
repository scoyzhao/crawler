/**
 * @file http小爬虫
 * @author <a href="www.llms.com">hwj</a>
 * @version 1.0
 */

/**
 * 获取http模块
 */
var http = require('http');
/**
 * 获取cheerio模块
 */
var cheerio = require('cheerio');
/**
 * 解析的目标网页
 */
var url = 'http://www.imooc.com/learn/348';

/**
 *
 * 将爬取到的网页内容进行过滤调整
 * @param {string} html
 * @returns {{chapterTitle:string,videos:[{title:string,time:string,id:string}]}} 返回过滤到的对象
 */
function filterChapters(html) {
    // cheerio加载html
    var $ = cheerio.load(html);
    var chapters = $('.chapter');

    var courseData = [];
    var chapter, Title, videos, chapterData;
    var videos, videoTitle, id;
    chapters.each(function(value) {
        chapter = $(this);
        /** nodeType返回值说明
         * 1-ELEMENT
         * 2-ATTRIBUTE
         * 3-TEXT
         * 4-CDATA
         * 5-ENTITY REFERENCE
         * 6-ENTITY
         * 7-PI (processing instruction)
         * 8-COMMENT
         * 9-DOCUMENT
         * 10-DOCUMENT TYPE
         * 11-DOCUMENT FRAGMENT
         * 12-NOTATION
         */
        // 过滤不提取子类中的text
        Title = chapter.find('strong').contents().filter(function() {
            return this.nodeType == 3;
        }).text().trim();

        // chapterData = {
        //     "chapterTitle": Title,
        //     "videos": []
        // }
        console.log('\n' + Title);

        videos = chapter.find('.video').children('li');
        videos.each(function(value) {
            video = $(this).find('.J-media-item');

            // 这个title包含了video的title和这个video的时间,两者用换行符分割
            videoTitles = video.contents().filter(function() {
                return this.nodeType == 3;
            }).text().trim().split('\n');

            id = video.attr('href').split('video/')[1];

            // chapterData.videos.push({
            //     "title": videoTitles[0].trim(),
            //     "time": videoTitles[1].trim(),
            //     "id": id
            // });
            console.log('  ' + id + ' ' + videoTitles[0].trim() + videoTitles[1].trim());
        });
        // courseData.push(chapterData);
    });
    // return courseData;
}

/**
 * 打印课程信息
 * @param {{chapterTitle:string,videos:[{title:string,time:string,id:string}]}} courseData 课程信息
 */
// function printCoursrInfo(courseData) {
//     var courseMessage = '';
//     courseData.forEach(function (value) {
//         courseMessage += value.chapterTitle + '\n';

//         value.videos.forEach(function (value) {
//             courseMessage += '[' + value.id + '] ' + value.title + ' time:' + value.time + '\n';
//         });

//         courseMessage += '\n';
//     });

//     console.log(courseMessage);
// }

http.get(url, function(res) {
    var html = '';

    res.on('data', function(data) {
        html += data;
    });

    res.on('end', function() {
        filterChapters(html);
        // printCoursrInfo(courseData);
        // console.log(courseData);
    });

}).on('error', function() {
    console.log('爬取失败!!!!');
});
