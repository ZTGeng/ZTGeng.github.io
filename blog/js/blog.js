/**
 * @version 0.10
 * @author Geng
 */

var PATH = "articles/";

var getArticle = function(filename) {
    $.getJSON(PATH + filename).done(parseAndShowArticle);
}

var parseAndShowArticle = function(data) {
    // console.log(data);

    showArticle(jsonToHtml(data));
}

var jsonToHtml = function(article) {
    var htmlContent = `<h2>${article.title}</h2><small>${article.date}</small><br>`;

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
            // case "link":
            //     str = `<a href="${paragraph.link}" target="_blank">${paragraph.content}</a>`
            //     break;
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

var main = function() {
	getArticle("2018.json");
};

$(document).ready(main);