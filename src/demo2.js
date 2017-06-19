import http from 'http';
import cheerio from 'cheerio';
import Promise from 'bluebird';

let baseUrl = 'http://www.imooc.com/learn/';
let videoIds = [348, 637, 259, 75, 197, 728, 134];
let fetchCourseArray = [];

function filterChapters(html) {
    let $ = cheerio.load(html);
    let chapters = $('.chapter');
    let courseTitle = $('.path').find('span').text();
    // 并没有写出来，而是通过后台js获取
    // let number = $('.js-learn-num').text();

    let courseData = {
        courseTitle,
        chaptersArr: [],
    };
    // console.log(courseData.courseTitle);
    chapters.each(function(item) {
        let chapter = $(this);
        // 这句具体理解一下，很关键。。。。
        let chapterTitle = chapter.find('strong').contents().filter(function() {
            return this.nodeType == 3;
        }).text().trim();
        let videos = chapter.find('.video').children('li');
        let chapterData = {
            chapterTitle,
            videos: [],
        }

        videos.each(function(item) {
            let video = $(this).find('.J-media-item');
            let videoTitles = video.contents().filter(function() {
                return this.nodeType == 3;
            }).text().trim().split('\n');
            let id = video.attr('href').split('video/')[1];

            chapterData.videos.push({
                title: videoTitles[0].trim(),
                time: videoTitles[1].trim(),
                id,
            });
        });

        courseData.chaptersArr.push(chapterData);
    });

    return courseData;
};

function printData(coursesData) {
    coursesData.forEach((courseData) => {
        let printMsg = `##### ${courseData.courseTitle} #####\n`;
        courseData.chaptersArr.forEach((chapter) => {
            printMsg += `${chapter.chapterTitle}\n`;

            chapter.videos.forEach((video) => {
                printMsg += `  [${video.id}] ${video.title} ${video.time}\n`;
            });
            printMsg += `\n`;
        });

        console.log(printMsg);
    })
};

function getPageAsync(url) {
    return new Promise((resolve, reject) => {
        console.log(`\n正在爬取 ${url}`);

        http.get(url, (res) => {
            let html = '';

            res.on('data', (data) => {
                html += data;
            });
            res.on('end', () => {
                resolve(html);
                // let courseData = filterChapters(html);
                // printData(courseData);
            });
        }).on('error', (e) => {
            reject(e);
            console.log('error');
        });
    });
};

videoIds.forEach((id) => {
    fetchCourseArray.push(getPageAsync(`${baseUrl}${id}`));
});

Promise
    .all(fetchCourseArray)
    .then((pages) => {
        let coursesData = [];

        pages.forEach((html) => {
            let courses = filterChapters(html);

            coursesData.push(courses);
        });

        // courseData.sort((a, b) => {
        //     return a.number < b.number;
        // });

        printData(coursesData);
    })
    .catch((reason) => {
        console.log(reason);
    });
