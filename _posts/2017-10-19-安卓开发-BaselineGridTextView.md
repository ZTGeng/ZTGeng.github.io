---
layout: post
title: 安卓开发：BaselineGridTextView
date: 2017-10-19 02:52:05
---

最近发现一些开源的现成的轮子，都很实用。
<!--more-->

`BaselineGridTextView`是一种在一定程度上自动为文字排版的TextView。这个组件设想屏幕上有一个4dp格子组成的网格​，然后将文字根据这个网格进行放置。这样在TextView内部和多个TextView之间，文字不会挤在一起，会有整齐的行距。比人工设置行距和padding要简单。

先解释一下概念：在排版中，字母文字带有所谓的Baseline基线。我们刚学英文的时候都使用过一种书写练习本，每一行由四条横线分成三行空行，字母就写在这四条横线上。Baseline相当于第三条横线。

`BaselineGridTextView`在构建和`onMeasure`阶段，做了这样三件事：

1. 在构建方法中，通过`setLineSpacing`方法，确保行高（每行文字高度加上行距）是4dp的倍数。
2. 在`onMeasure`方法中，通过在整个TextView上方加上额外的padding的方法，确保第一行文字的Baseline与网格重合。这个额外的padding最终会成为`paddingTop`的一部分。
3. 类似地，在整个TextView下方加上额外的padding，确保整个TextView的高度是4dp的倍数。

这个过程有可能会改变行数，所以之后`onMeasure`还要重新检查一下行数，设置一下`setMaxLines`。

找机会试一下这个组件进行中文排版的效果。

代码：[BaselineGridTextView.java](https://github.com/nickbutcher/plaid/blob/master/base/src/main/java/io/plaidapp/base/ui/widget/BaselineGridTextView.java){:target="_blank"}