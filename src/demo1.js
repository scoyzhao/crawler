import http from 'http';
import cheerio from 'cheerio';

var url = 'http://www.imooc.com/learn/348';

function filterChapters(html) {
    let $ = cheerio.load(html);
    let chapters = $('.chapter');

    let courseData = [];
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

        courseData.push(chapterData);
    });

    return courseData;
}

function printData(courseData) {
    let printMsg = '\n';
    courseData.forEach((chapter) => {
        printMsg += `${chapter.chapterTitle}\n`;

        chapter.videos.forEach((video) => {
            printMsg += `  [${video.id}] ${video.title} ${video.time}\n`;
        });
        printMsg += `\n`;
    });

    console.log(printMsg);
}

http.get(url, (res) => {
    let html = '';

    res.on('data', (data) => {
        html += data;
    });
    res.on('end', () => {
        let courseData = filterChapters(html);
        printData(courseData);
    });
}).on('error', function() {
    console.log('error');
});
