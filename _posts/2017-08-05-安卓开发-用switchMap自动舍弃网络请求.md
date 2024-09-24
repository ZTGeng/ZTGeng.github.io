---
layout: post
title: 安卓开发：用switchMap自动舍弃网络请求
date: 2017-08-05 02:54:14
---

我发现项目里的网络请求是响应式的。比方说你提交一个搜索请求，首先找到Client，然后使用方法`client.search(Request<...>)`。这个方法返回的是一个`Single<Response<...>>`，你subscribe它，可以确定获得一个响应或者错误。
<!--more-->

有时候我们可能会发送一系列请求，但只关心最后一个。例子比如：我们希望在检测到用户输入时立刻发送搜索请求。但输入是连续的过程，用户每添加一个新的字符，就意味着可能会发一个请求出去——当然要debounce，在用户停止输入一段时间（比如0.5秒）之后再发送。但即使这样，用户也可能一个单词写了一半时打了个喷嚏停顿了一下，Client发了两个请求。现在问题是，当产生新的请求时，哪怕旧的还没有收到响应，也可以将其忽略。“忽略”如果是指接受旧的响应但不作处理，那并不是一个有效率的办法。既然响应是你订阅的一个Single，合理的处理方式应该是退订它。

我看到两种“退订”的方式，效果应该是一样的，区别可能是第二种好看一点。

第一种是：将每次subscribe返回的Disposable保存起来，发送新请求之前先对旧的进行dispose。Rxjava2的subscribe(Observer)返回void，这时候可以用subscribeWith，然后使用可以dispose的Observer。

代码写出来就像这样：

```java
myDisposable.dispose();
myDisposable = client.search(request)
        .subscribeWith(new DisposableSingleObserver() {...});
```

这段代码放在一个Listener里面，从事件源那边调用。

这种也没什么不好。但是还有第二种：如果事件源本身是一个Observable的话，可以用switchMap将多个网络请求Single包装在这个Observable下，然后switchMap自身就会负责dispose旧的订阅。

代码写出来像这样：

```java
eventObservable
        .debounce(...)
        .switchMapSingle(new Function<..., SingleSource<...>>() {
            @Override
            public SingleSource<...> apply(...) {
                return client.search(request);
            }
        })
        .subscribe(new SingleObserver() {...});
```

为什么说这种好看呢？主要是因为一链到底。不用Listener，不用把代码分两遍，不用寄几操心dispose。新事件到来，switchMap切换到一个新的client.search()请求，旧的Single会自动被处理。所以我们最后用了第二段代码。​​​​