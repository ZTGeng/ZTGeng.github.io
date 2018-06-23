/**
 * @version 0.10
 * @author Geng
 */

var PATH = "articles/";
var LIST_NAME = "list.json";
var SHOW_ARTICLE_NUM = 7;

var showArticleFrom = 0;
var showArticleTo = 0;
var articleList;

var getList = function() {
    $.getJSON(LIST_NAME).done(function(data) {
        articleList = data.list;
        showArticleTo = Math.min(SHOW_ARTICLE_NUM, articleList.length);
        showList(0, showArticleTo);
    });
}

var showList = function (from, to) {
    $('#list').empty();
    for (let i = from; i < to; i++) {
        let article = $(`<a href="#" class="list-group-item list-group-item-action"><h6 class="mb-0">${articleList[i].title}<br><small>${articleList[i].date}</small></h6></a>`);
        article.data("filename", articleList[i].filename);
        article.click(function () {
            if (article.hasClass("current")) {
                return;
            }
            getArticle(article.data("filename"));
            $('.current').removeClass("current disabled");
            article.addClass("current disabled");
        });
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
    $.getJSON(PATH + filename).done(parseAndShowArticle);
}

var parseAndShowArticle = function(data) {
    // console.log(data);

    showArticle(jsonToHtml(data));
}

var jsonToHtml = function(article) {
    var htmlContent = `<h2 id="article_title">${article.title}</h2><p id="artical_date">${article.date}</p><br>`;

    var paragraphs = article.text;
    paragraphs.forEach(paragraph => {
        var str = "";
        switch (paragraph.type) {
            case "code":
                str = `<pre><code>${paragraph.content}</code></pre>`
                break;
            case "image":
                str = `<img src=${paragraph.link}>`
                break;
            case "number_list":
                str = "<ol>";
                paragraph.content.forEach(item => {
                    str = str.concat(`<li>${item}</li>`);
                });
                str = str.concat("</ol>");
                break;
            case "bullet_list":
                str = "<ul>";
                paragraph.content.forEach(item => {
                    str = str.concat(`<li>${item}</li>`);
                });
                str = str.concat("</ul>");
                break;

            default:
                str = `<p>${paragraph.content}</p>`
                break;
        }
        htmlContent = htmlContent.concat(str).concat("</p>");
    });

    return htmlContent;
}

var showArticle = function(html) {
    $('#article').html(html)
}

var main = function () {
    $('#prev').click(function() {
        if (!articleList || articleList.length == 0 || showArticleFrom == 0) {
            return;
        }
        showArticleFrom = Math.max(showArticleFrom - SHOW_ARTICLE_NUM, 0);
        showArticleTo = Math.min(showArticleFrom + SHOW_ARTICLE_NUM, articleList.length);
        showList(showArticleFrom, showArticleTo);
    });
    $('#next').click(function() {
        if (!articleList || articleList.length == 0 || showArticleTo == articleList.length) {
            return;
        }
        showArticleTo = Math.min(showArticleTo + SHOW_ARTICLE_NUM, articleList.length);
        showArticleFrom = Math.max(showArticleTo - SHOW_ARTICLE_NUM, 0);
        showList(showArticleFrom, showArticleTo);
    });
    // getArticle("2018.json");
    getList();
};

$(document).ready(main);