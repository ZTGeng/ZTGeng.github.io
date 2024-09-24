---
layout: post
title: 安卓开发：在Builder链式调用中加入if环节
date: 2017-06-19 12:02:24
---

（以下是自己瞎琢磨的，兴许早就有人这么干了。）

我们要解决这样一个问题：

假设你在用 Builder 模式来创建一个对象，比如这样：​
<!--more-->

```java
User user = new User.Builder()
    .username("test_account")
    .email("test@example.com")
    .build();
```

这时你希望：只有当输入的 email 是一个有效的邮件地址时，才设置这一项；否则就忽略 email。通常我们会这样修改代码：

```java
User.Builder builder = new User.Builder()
    .username("");
if (isValidEmail(emailStr)) {
  builder.email(emailStr);
}
User user = builder.build();
```

这样当然没什么不好。但是如果你特别喜欢一条链解决问题，其实也有办法保持链条不断。

第一个办法是使用三目运算符。在 Builder 方法支持的前提下，你可以写：

```java
builder
    .email(isValidEmail(emailStr) ? emailStr : "") // 或者 null
```

但是有时候 Builder 不希望你叫 email("") 或者 email(null)。Builder 希望你忽略这项设置，甚至可能要求你做一些其他操作（比如记录这个错误事件等等），总之三目运算符搞不定。这个时候你的另一个选择是：在 Builder 里创建一个 if-then 环节。

你要做的只是在 Builder 中加入以下方法：

```java
public Builder ifThen(boolean condition, Function<Builder, Void> statement) {
  if (condition) {
    statement.apply(this);
  }
  return this;
}
```

然后你就可以这么调用：

```java
User user = new User.Builder()
    .username("test_account")
    .ifThen(isValidEmail(emailStr), builder -> {
      builder.email(emailStr);
      return null;
    })
    .build();
```

这样就实现了与上面第二段代码​完全等价的操作，同时避免生成 Builder 对象。好处主要是易读性方面，逻辑链清晰。不过也许有人喜欢上面第二段代码那样简单直接，见仁见智吧。

还可以进一步扩展为 if-then-else 操作：

```java
public Builder ifThenElse(
    boolean condition,
    Function<Builder, Void> thenStatement,
    @Nullable Function<Builder, Void> elseStatement) {
  if (condition) {
    thenStatement.apply(this);
  } else if (elseStatement != null) {
    elseStatement.apply(this);
  }
  return this;
}​​​​
```