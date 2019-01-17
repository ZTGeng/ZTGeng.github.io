/**
 * @version 0.20
 * @author Geng
 */

var ARTICLES_PATH = "articles/";
var IMAGES_PATH = "images/";
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
                if (from) {
                    showArticleFrom = from;
                }
            }
        });
    }
    getList();
};

$(document).ready(main);