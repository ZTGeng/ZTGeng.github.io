---
layout: post
title: 写了一个Node.js服务端与Android客户端以实现远程读取短信
date: 2019-01-16 17:21:16
---

Github：

* 服务端repo：[https://github.com/ZTGeng/sms-sender-server](https://github.com/ZTGeng/sms-sender-server){:target="_blank"}
* 客户端repo：[https://github.com/ZTGeng/sms-sender-android](https://github.com/ZTGeng/sms-sender-android){:target="_blank"}

#### 需求

我使用国内的网站服务时经常需要收验证码，所以特意保留了国内的手机和卡。但是这个手机留在家里，我白天在外面需要收验证码时就没办法了。于是考虑做一个app，在我需要的时候将最新的若干条短信发给我。
<!--more-->

本质上这是一种“云短信”需求。现有一些服务，如谷歌Message等可以实现类似功能，但我的需求与这些服务略有差别：

* 我希望在启动服务后可以长期待机（谷歌Message在14天未使用时会退出登录，重新登录需要使用设备扫二维码，但如果我能用设备扫码干嘛不直接看短信？）；
* 不需要同步全部短信，只需要在某些时候读取最新的短信；
* 读取的信息应该阅后即焚；
* 不需要支持多用户，我是唯一用户（大概……吧）。

#### 技术

首先需要一个Android app运行在手机上。<br>
这个app需要不定时收到消息。需要一个消息传输服务。选用了谷歌的Firebase Cloud Messaging（FCM），也就是以前的GCM。<br>
需要发起请求，传输和阅读短信。决定搭建一个超小型的http服务端。选用Node.js，因为我熟。<br>
服务端需要运行于一个平台上。选用谷歌云。本来AWS更熟悉但我的账号过了免费期了，借这次机会发现谷歌云某一档引擎是长期免费的。

#### 实现

详见代码。代码不长，还有注释。<br>
以下就只是`聊聊开发过程中的感受和一些踩过的坑好了。

##### 服务端 - Node.js

没有用别的库，连Express都没用，自己写了一个路由，像这样：

```javascript
// 手机端：更新设备的FCM Token。
if (method == 'POST' && path == '/token') {
    getBody(req, (data) => {
        token = data;
        console.log("New token: " + data);
    });
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Token update success!")
    return;
}

// 手机端：发送短信文本，格式为JSONArray。
if (method == 'POST' && path == '/sms') {
    getBody(req, (data) => {
        var sms = JSON.parse(data);
        resBuffer.end(parseSms(sms));
        console.log(JSON.stringify(sms, null, 2));
    });
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Send sms success!")
    return;
}
```

因为总共就4条API，实在没必要上Express。Do it in hard way了。还能大大减少依赖库体积。

开始还想说要不学着搭一下https服务器。还真的弄出来了，和http的区别是额外需要几个certificate用的文件，privatekey.pem之类的。但是访问不了。浏览器（Chrome）直接报有害网站给屏蔽了（冤枉那包大人！），Android端也联不通。又换回http了。应该是证书没有认证的缘故？

基本思路是网页那边的请求过来时，将response暂存起来，同时发出FCM消息给手机。手机收到消息后会使用另一个API将短信文本发来，这时再返回给刚才暂存的response。暂存机制的代码长这样：

```javascript
// 暂时地保存请求方的http response，以便在获取短信文本后通过它返回给请求方。
// 您也可以考虑不保存response，而是通过FCM消息的方式发送文本给请求方。
var resBuffer = function() {
    var resTemp;
    var timer;

    // （据说）一些浏览器在超过120秒未获得响应时会终止连接。因此我们限制等待时间为110秒。
    var start = (res) => {
        clearTimeout(timer);
        drop();
        resTemp = res;
        timer = setTimeout(drop, 110000);
        console.log("Waiting for fetching sms result");
    };
    var drop = () => {
        if (resTemp) {
            resTemp.writeHead(204, { "Content-Type": "text/html; charset=utf-8" });
            resTemp.end("<p>Failed to fetch sms!</p>");
            resTemp = null;
            console.log("Res buffer dropped due to timeout or new request coming");
        }
    };
    var end = (html) => {
        clearTimeout(timer);
        if (resTemp) {
            resTemp.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            resTemp.end(html);
            resTemp = null;
            console.log("Sms fetching result sent to requester");
        } else {
            console.log("Previous res buffer was unexpected dropped!")
        }
    };

    return {
        start: start,
        end: end
    };
}();
```

说实在话我不知道这是不是处理这个问题（这算啥？“异步响应请求”？）的标准方式。就是说收到请求后需要完成一些高延迟的工作再响应，或者可能不响应。我总感觉request和response是一起来的也应该一起走，不应该把其中一个存起来。但我也说不出为什么不该这样。也许有更好的做法，或者其实应该用其它方式返回消息。

Response只保存110秒，因为我好像在哪看到说浏览器120秒等不到response就不等了。我这边至少要在此之前返回出错信息，加上网络延迟所以限定为110秒。

以及原来JavaScript里的Singleton是这样搞的呀！

返回的数据类型，手机端统一为`text/plain`以便log，网页端统一为`text/html`以便render。

然后因为只有一个用户所以也没有搭数据库。但是有两样东西就需要另找地方保存了：一是设备的FCM Token，二是一个静态password，以防知道我服务器网址的人都来看我短信。

FCM Token可能会由客户端更新，没办法只好用一个变量存着。每次服务器重启就丢失了。所以其实还是需要数据库的。Firebase好像有数据库服务。

用户口令更新频率低，所以静态保存在文件中。正好FCM要用到一个私钥文件，我就直接在里面夹带私货。这样在公开repo里是看不见的。

##### 客户端 - Kotlin + Android

（这才是我本行啊，JavaScript是什么鬼！）

这是我第一个用Kotlin写的项目。之前以为会很难，没想到IDE出来接管全场！我懵懵懂懂地写点啥，intellij马上接茬：

“亲`object`不是这样用的哟我替您改好了亲”<br>
“亲我们家不用写分号的亲”<br>
“亲您写的是java风格的哟要不要试试我们家新出的`when`语句呀亲”<br>
……

真的如果让我声明知识产权我都不好意思说这app是我写的……

构架也很简单。一个Activity；一个Service后台运行：响应消息，读取短信，发送，更新token；一个网络客户端发送http请求，用了谷歌的一个库Volley来实现的。

Volley属于轻量级的网络客户端，小，所需代码短，功能简单。这个项目因为应用场景很少也不复杂所以够用了，再复杂一些还是需要Retrofit。

第一次使用时需要输入服务器IP，之后IP储存在SharedPreferences中。某些时候服务器会更换IP地址，其实新地址可以放在FCM消息中传过来。考虑下一版加上。

FCM消息下可以有`notification`和`data`等关键字。如果`notification`存在，这条消息就被定义为一条可显示的“通知”，否则就只是数据消息。其在处理方式上的区别在于：

* 如果app在前台运行，则没有区别，都会触发Service的`onMessageReceived()`方法来处理数据。
* 如果app在后台运行，可显示通知不会触发`onMessageReceived()`，只会进入Android的通知栏，显示`notification`包含的数据，即使同时存在`data`数据，也只会作为extra被放入Intent中；而不含`notification`的数据消息则会正常触发`onMessageReceived()`。

我的服务端发送的消息是数据消息。目前只包含两个有用信息，一是一个collapseKey通知app发送短信，不过目前消息只有这一种用途，只要收到就肯定是请求发送短信的，这个值实际上没用；二是一个数字告诉app读取多少条短信。

读取短信需要用户授权。我在app启动时，在`onCreate()`里检查权限，如下：

```java
if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
    ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.READ_SMS), permissionRequestCode)
}
```

理论上第一次打开app时就应该请求授权，之后就不用重新授权了。不过Android的权限机制发生过变化，实测结果是：在Android 8设备上结果如预期；在Android 4.4设备上，启动app并不会触发授权请求，app会认为已经授权，但在第一次读取短信时还是会弹出请求。这就很麻烦，授权必须预先完成，否则等到用户请求读取短信时多半是远程状态，无法操作设备的。如果找不到更好的办法，hacky的解决方式是`onCreate()`时先读取一次短信。

目前的app并没有很完善。很多需要在`onResume()`里做的检查都没有做，比如检查Google Play Service的状态，这是FCM SDK要求的。

#### 更多阅读

还是推荐阅读官方文档：<br>
[FCM Android SDK 教程](https://firebase.google.com/docs/cloud-messaging/android/client){:target="_blank"}<br>
[FCM 服务端 SDK 教程](https://firebase.google.com/docs/admin/setup){:target="_blank"}<br>
[FCM 服务端发送消息](https://firebase.google.com/docs/cloud-messaging/admin){:target="_blank"}<br>
[FCM 首页（创建新项目）](https://console.firebase.google.com/){:target="_blank"}<br>
[Volley 官方教程](https://developer.android.com/training/volley/){:target="_blank"}