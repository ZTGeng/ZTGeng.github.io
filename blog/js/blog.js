/**
 * @version 0.10
 * @author Geng
 */

var ARTICLES_PATH = "articles/";
var IMAGES_PATH = "images/";
var ARTICLE_EXT = ".json";
var LIST_FILENAME = "list.json";
var SHOW_ARTICLE_NUM = 7;

var showArticleFrom = 0;
var showArticleTo = 0;
var articleList;

var getList = function() {
    $.getJSON(LIST_FILENAME).done(function(data) {
        articleList = data.list;
        showArticleTo = Math.min(showArticleFrom + SHOW_ARTICLE_NUM, articleList.length);
        showList(showArticleFrom, showArticleTo);
    });
}

var showList = function (from, to) {
    $('#list').empty();
    for (var i = from; i < to; i++) {
        let url = `?p=${articleList[i].filename}`;
        if (from !== 0) {
            url = url.concat(`&from=${from}`);
        }
        let article = $(`<a href="${url}" class="list-group-item list-group-item-action"><h6 class="mb-0">${articleList[i].title}<br><small>${articleList[i].date}</small></h6></a>`);
        $('#list').append(article)
    }
    if (from > 0) {
        $('#prev').removeClass("invisible");
    } else {
        $('#prev').addClass("invisible");
    }
    if (to < articleList.length) {
        $('#next').removeClass("invisible");
    } else {
        $('#next').addClass("invisible");
    }
}

var getArticle = function(filename) {
    $.getJSON(ARTICLES_PATH.concat(filename).concat(ARTICLE_EXT)).done(parseAndShowArticle);
}

var parseAndShowArticle = function(data) {
    $('#article').html(jsonToHtml(data));
}

var jsonToHtml = function(article) {
    var htmlContent =
        `<h2 id="article_title">${article.title}</h2><p id="artical_date">${article.date}</p><br>`;

    var paragraphs = article.text;
    paragraphs.forEach(paragraph => {
        var str = "";
        switch (paragraph.type) {
            case "head":
                str = `<h4>${parsePlainText(paragraph.data)}</h4>`
                break;
            case "code":
                str = `<pre class="bg-light p-2"><code>${paragraph.data}</code></pre>`
                break;
            case "image":
                var isUrl = paragraph.data.slice(0, 7) === "http://" || paragraph.data.slice(0, 8) === "https://";
                str = `<img src="${isUrl ? paragraph.data : IMAGES_PATH + paragraph.data}" class="img-fluid">`
                break;
            case "number_list":
                str = "<ol>";
                paragraph.data.forEach(item => {
                    str = str.concat(`<li>${parsePlainText(item)}</li>`);
                });
                str = str.concat("</ol>");
                break;
            case "bullet_list":
                str = "<ul>";
                paragraph.data.forEach(item => {
                    str = str.concat(`<li>${parsePlainText(item)}</li>`);
                });
                str = str.concat("</ul>");
                break;
            case "quote":
                str = `<p class="text-justify ml-4 p-2 bg-secondary text-white">${parsePlainText(paragraph.data)}</p>`;
                break;
            case "line":
                str = "<hr>";
                break;
            default:
                str = `<p class="text-justify">${parsePlainText(paragraph.data)}</p>`
                break;
        }
        htmlContent = htmlContent.concat(str);
    });

    return htmlContent;
}

var parsePlainText = function (text) {
    return text
        .replace(/\*\*[^\n]*?\*\*/g, match => `<strong>${match.slice(2, -2)}</strong>`)
        .replace(/\/\/[^\n]*?\/\//g, match => `<em>${match.slice(2, -2)}</em>`)
        .replace(/\`\`[^\n]*?\`\`/g, match => `<code>${match.slice(2, -2)}</code>`)
        .replace(/\[\[[^\n]*?\]\]/g, match => {
            var [link, words] = match.slice(2, -2).split('|', 2);
            return `<a href="${link}" target="_blank">${words}</a>`;
        })
        .replace(/\n/g, "<br>");
}

var main = function() {
    $('#prev').click(function() {
        if (!articleList || articleList.length === 0 || showArticleFrom === 0) {
            return;
        }
        showArticleFrom = Math.max(showArticleFrom - SHOW_ARTICLE_NUM, 0);
        showArticleTo = Math.min(showArticleFrom + SHOW_ARTICLE_NUM, articleList.length);
        showList(showArticleFrom, showArticleTo);
    });
    $('#next').click(function() {
        if (!articleList || articleList.length === 0 || showArticleTo === articleList.length) {
            return;
        }
        showArticleFrom = showArticleTo;
        showArticleTo = Math.min(showArticleFrom + SHOW_ARTICLE_NUM, articleList.length);
        showList(showArticleFrom, showArticleTo);
    });
    // getArticle("test.json");
    var searchString = window.location.search;
    if (searchString.length !== 0) {
        var params = decodeURIComponent(searchString.slice(1)).split('&');
        params.forEach(param => {
            if (param.slice(0, 2) === "p=") {
                getArticle(param.slice(2));
            } else if (param.slice(0, 5) === "from=") {
                var from = parseInt(param.slice(5));
                console.log(from);
                if (from) {
                    showArticleFrom = from;
                }
            }
        });
    }
    getList();
};

$(document).ready(main);