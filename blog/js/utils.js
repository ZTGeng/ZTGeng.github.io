/**
 * @version 0.20
 * @author Geng
 */

var ARTICLE_EXT = ".json";
var IMAGES_PATH = "images/";

var jsonToHtml = function(article, showdate = true) {
  var htmlContent = "";
  if (article.title) {
    htmlContent = htmlContent.concat(`<h2 id="article_title">${article.title.replace(/\[\[HASH\]\]/g, "#")}</h2>`);
  }
  if (showdate && article.date) {
    htmlContent = htmlContent.concat(`<p id="artical_date">${article.date}</p>`);
  }

  var paragraphs = article.text;
  if (!paragraphs) {
    return htmlContent;
  }

  if (htmlContent) {
    htmlContent = htmlContent.concat("<br>");
  }
  paragraphs.forEach(paragraph => {
      var str = "";
      switch (paragraph.type) {
          case "head":
              str = `<h4>${parsePlainText(paragraph.data)}</h4>`
              break;
          case "code":
              str = `<pre class="bg-light p-2" style="white-space: pre-wrap"><code>${paragraph.data.replace(/\[\[HASH\]\]/g, "#")}</code></pre>`
              break;
          case "image":
              var isUrl = paragraph.data.slice(0, 7) === "http://" || paragraph.data.slice(0, 8) === "https://";
              str = `<img src="${isUrl ? paragraph.data.replace(/\[\[HASH\]\]/g, "#") : IMAGES_PATH + paragraph.data.replace(/\[\[HASH\]\]/g, "#")}" class="img-fluid">`
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
      .replace(/\*[^\n]*?\*/g, match => `<em>${match.slice(1, -1)}</em>`)
      .replace(/\`\`[^\n]*?\`\`/g, match => `<code>${match.slice(2, -2)}</code>`)
      .replace(/\[\[HASH\]\]/g, "#")
      .replace(/\[\[[^\n]*?\]\]/g, match => {
          var [link, words] = match.slice(2, -2).split('|', 2);
          return `<a href="${link}" target="_blank">${words}</a>`;
      })
      .replace(/\n/g, "<br>");
}