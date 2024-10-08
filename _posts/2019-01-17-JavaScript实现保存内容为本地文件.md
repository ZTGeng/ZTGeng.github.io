---
layout: post
title: JavaScript实现保存内容为本地文件
date: 2019-01-17 23:37:25
---

我的Github Pages有[写博客功能](/2018/06/24/用Github-Pages写博客.html)，但是实际上Github Pages不支持在线保存内容，我的博客编辑页面其实只是个伪markdown编辑器，写完之后我需要手动保存到本地文件，然后git push到Github Pages的repo。
<!--more-->

之前没有找到保存文件的方法，还以为需要用JavaScript读写本地文件，查了半天发现做不到，就放弃了，改为将parse好的json显示出来，一键复制到剪贴板，然后在vscode里手动创建文件再ctrl-V。还觉得挺方便的。这次因为查别的东西，无意中看到了解决方法！

那个帖子里提到的方法是使用一个`<a>` tag，设置它的`href`属性为`"data:application/x-json;base64," + btoa(...)`，逗号之后直接跟上要保存的内容，点击之后就会变成下载文件……我看到的时候炸裂，这么好用的东西怎么就没人教我一下？还有这个“data:”是什么鬼？想详细查查，一开始以为“data:”是个什么类似“http://”的网络传输协议，但是翻传输协议列表又翻不到。最后才知道这个叫[Data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs){:target="_blank"}。

数据类型其实可以用`text/plain`或者`text/json`等。我尝试了一下把

```
data:text/plain,The quick brown fox jumps over the lazy dog
```

直接复制到地址栏，结果会直接显示在浏览器上；而改成`data:application/x-json,...`就会变成下载文件。可能和浏览器的实现有关。不过从jQuery里模拟点击`data:text/plain,...`的话也是会触发下载的。

加上`;base64`的话就说明后面跟着的文本应该是base64的ASCII形式，也就是先要用`btoa()`（binary to ascii）转化一下。不加`;base64`就不用。对文字内容来说两种方式生成的文件是一样的，所以我觉得没有必要转成base64再转回来。base64真正解决的问题是可以将任何二进制内容，包括图片，编码成字符串（“64”的意思就是用a-z、A-Z、0-9再加两个标点符号，这64个字符来编码一切）。文字也是二进制内容，当然也可以编码。“The quick brown fox jumps over the lazy dog”用`btoa()`编码后的结果是“VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==”。这些编码等到生成文件时会再`atob()`转回原来的二进制内容。如果我需要保存非文字内容的话是需要这么搞的。

（说到这里你大概会想试一下把

```
data:text/plain;base64,VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==
```

复制到地址栏，试吧你看我都替你写好了。）

触发下载时默认的文件名是“download”。如果要定制，只需要在`<a>` tag上加一个属性：`filename=...`。

而要用jQuery触发这个URI，一些帖子建议用`window.location.href=data:...`这样的语句。实测不行，浏览器报错。后来用的方法是临时生成一个`<a>` tag的jQuery对象，设好属性，`appendTo`到页面（因为tag里面是空的所以不会被看到），触发点击（jQuery不能触发`href`类型的点击事件，要先用`aTag[0]`获取原生DOM再做），最后再把这个对象移除。最后代码长这样：

```javascript
var saveToFile = function (json) {
    var temp = $('<a></a>');
    temp.attr({
        download: json.filename.concat(ARTICLE_EXT),
        href: "data:text/plain," + JSON.stringify(json, null, 2)
    });
    temp.appendTo($('body'));
    temp[0].click();
    temp.remove();
}
```

本篇文章就是用这个代码保存到本地的。（当然是在parse格式、设置标题和文件名等之后。详见文章开头链接链到的那篇。）这算是我的博客系统一次不小的更新。同时更新的还有预览功能。因为之前的”显示最终JSON文本“功能不需要了，就改为显示渲染之后的html。

此外还改进了一点关于代码缩进的格式问题。之前对代码块的处理基本上就是原样保存原样显示。而我从别处复制粘贴来的代码块往往是有缩进的，每行前面会有数量不等的空格。之前这些空格会全部显示出来。其实如果每一行都有空格，那也没必要，可以统一减去多余数量的空格将代码块靠左显示。相关代码是这样的：

```javascript
var parseCode = function (code) {
    var lines = code.split("\n");
    var trimHead = lines[0].length;
    lines.forEach(line => {
        if (line.trim().length != 0) {
            var spaceHead = line.search(/\S|$/);
            trimHead = Math.min(trimHead, spaceHead);
        }
    });
    var re = new RegExp("^\\s{" + trimHead + "}|\\s+$", "g");
    var codeTrimmed = lines.map(line => line.replace(re, "")).join("\\n");
    return JSON.parse(`{"type": "code", "data": "${codeTrimmed}"}`);
}
```

遍历代码中的每一行，计算需要统一删除的空格数（变量`spaceHead`是每行前面的空格数，取所有行中的最小值，忽略空行）。用一个正则表达式替换删除每行开头该数量的空格以及每行结尾的全部空格。JavaScript字符串的`replace()`方法，第一个参数可以是一个正则表达式，此处需要的是（以开头删除4个空格为例）`/^\s{4}|\s+$/`。但是普通的正则表达式不可以插入变量，所以先生成了该正则表达式的字符串，再用它生成一个`RegExp`对象作为参数使用。需要注意的是该字符串与普通正则表达式是有区别的，反斜杠要escape出来。