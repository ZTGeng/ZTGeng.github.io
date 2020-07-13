const http = require('http');
const fs = require('fs');
const url = require('url');

var chapterMap = require('./chapter-map').map;

function create() {
    return http.createServer((req, res) => {
        var q = url.parse(req.url, true);
        console.log(`${req.method} ${q.path}`);

        if (req.method !== 'GET') {
            write404(res);
            return;
        }

        switch (q.pathname) {
            case '/':
                fs.readFile('game.html', (err, data) => {
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    res.write(data);
                    res.end();
                });
                return;
            case '/next':
                var chapter = q.query.chapter;
                var option = q.query.option;
                var nextChapter;
                if (chapterMap[chapter] && chapterMap[chapter][option]) {
                    nextChapter = "chapters/" + chapterMap[chapter][option] + ".json";
                } else {
                    console.log("Error on chapter: " + chapter + ", option: " + option);
                    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
                    res.end('{ "key": 0, "texts": [ "找不到章节" ], "options": [] }');
                    return;
                }
                fs.exists(nextChapter, exists => {
                    if (exists) {
                        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
                        fs.createReadStream(nextChapter).pipe(res);
                    } else {
                        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
                        res.end('{ "key": 0, "texts": [ "找不到章节" ], "options": [] }');
                    }
                    
                });
                return;
            default:
                getFile(q.pathname, res);
                return;
        }

        write404(res);
    });
}

function getFile(pathname, res) {
    var filepath = "." + pathname;
    fs.exists(filepath, exists => {
        if (exists) {
            var path = pathname.split("/");
            var ext = path[path.length - 1].split(".")[1];
            var contentType;
            switch (ext) {
                case "js":
                    contentType = "application/x-javascript; charset=utf-8";
                    break;
                case "html":
                    contentType = "text/html; charset=utf-8";
                    break;
                case "jpg":
                    contentType = "image/jpeg";
                    break;
                case "ico":
                    contentType = "image/x-icon";
                    break;
                default:
                    contentType = "text/plain; charset=utf-8";
                    break;
            }
            res.writeHead(200, { "Content-Type": contentType });
            fs.createReadStream(filepath).pipe(res);
        } else {
            write404(res);
        }
    });
}

function write404(res) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<p>File Not Found!</p>");
}

exports.create = create;
