---
layout: post
title: ChatGPT教我破解网络课程python环境
date: 2023-12-25 01:18:58
---

是这样的。

我正在学一门在线课程。这个课程的页面上有一个 Jupyter Notebook，上面有一些预先写好的 python 代码。其中最开始的几行是这样的：
<!--more-->

```python
import os
import lamini

lamini.api_url = os.getenv("POWERML__PRODUCTION__URL")
lamini.api_key = os.getenv("POWERML__PRODUCTION__KEY")

from llama import BasicModelRunner
```

就是加载了几个库，运行里面的代码。在页面上运行一切都很美好。

然后我心血来潮，我想在本地运行。

可以看到本地运行是需要注册 API_KEY 的。我一面去注册，一面想着先把环境搭起来。

所以我就打开终端，进虚拟环境，然后装这几个库。我准备课程跟到哪我就装到哪。

先装 `pip install lamini`，没问题，很丝滑。

再装第二个，`llama`，我就发现不对。

“Llama”是 Meta 出的语言模型。目前官网上是让你去 Github 下载他们的 repo，没有提到要装什么 python 库。PyPI 上也没有 llama 这个库，或者都不是官方的。

但是课程代码是这么写的，那肯定是课程所在的环境里有 llama 这个东西。关键这课程也没有环境安装相关的指导。人根本就没想让你在你的机器上运行这些代码。

那我要怎么装呢？

我发现，这个 Jupyter 上面的代码是可以随便改的，我可以运行任何 python 代码。所以我就开始和这个在线 Jupyter 系统斗智斗勇。

我先去 ChatGPT 问：如何用 python 代码列出当前环境安装的所有 python 库？即类似 `pip list` 的结果。

ChatGPT 给了我几行代码：

```python
# Importing the required module to list installed packages
import pkg_resources

# Listing installed packages
installed_packages = sorted(["%s==%s" % (i.key, i.version) for i in pkg_resources.working_set])
installed_packages
```

我复制粘贴到课程页的 Jupyter 里，执行，成了！课程所在 python 环境下安装的库全都列出来了！

（顺便说一下 ChatGPT 刚才给我代码的时候还给出了它自己执行的结果，等于是它把自己所在的 python 环境的库列表也暴露给我了！真不把哥们当外人。）

我仔仔细细地把这个列表过了一遍，至少通过名字没有找到和“llama”或者“meta”有关的库。

我又去跟 ChatGPT 说：我在列表里没有找到 llama 库，但是 `import` 可以正常执行，这是为什么？

ChatGPT 说了几个可能的原因，说可能是本地的模块，或者包装、重命名过的库等等。最后说，可以试着检查这个模块的文件位置，给了两行代码：

```python
import llama
print(llama.__file__)
```

我拿回课程页上执行，顺利拿到了一个文件路径，指向一个“/usr/local/lib/python3.9/site-packages/llama/__init__.py”文件。我转手又贴回给 ChatGPT。

ChatGPT 也很奇怪，它说既然有这个文件，说明 llama 是安装在当前环境里的，pkg_resources 没列出来有几种可能，但是我最好还是再通过 `pip list` 检查一下。然后它还教我如何在 python 代码里运行 pip 命令：

```python
import subprocess

result = subprocess.run(["pip", "list"], stdout=subprocess.PIPE)
print("llama" in result.stdout.decode())
```

但是这段代码报错了，说找不到 pip 文件。就是服务器端有 python 但是没有 pip。我把错误提示贴给 ChatGPT，它又给我换了一段代码：

```python
import subprocess

result = subprocess.run(["python", "-m", "pip", "list"], stdout=subprocess.PIPE)
print(result.stdout.decode())
```

这回成了，把课程环境的库列表又打印了一遍，和刚才打印的一样。

我还不放心，把整个列表贴给 ChatGPT 看，它看了说确实没有 llama 这个库，但这个模块又确实存在，可能是非标准安装，或者它是某个库的一部分。最后说建议检查一下这个目录下的内容等等。

我就问它怎么看目录下的内容，它又给了我一段代码：

```python
import os

# 设置要查看的目录路径
directory_path = '/usr/local/lib/python3.9/site-packages/llama'

# 列出目录中的所有内容
directory_contents = os.listdir(directory_path)

# 打印目录内容
for item in directory_contents:
    print(item)
```

我复制粘贴执行，得到两行结果：

```
__init__.py
__pycache__
```

ChatGPT 一看就说：这是典型的 python 包结构，但是这个目录很空，说明这个包很简单，或者它是别的包的一部分。具体是什么情况很难说。它建议我把 __init__.py 的内容打印出来看看，给了代码：

```python
# 读取并打印 __init__.py 文件的内容
init_file_path = '/usr/local/lib/python3.9/site-packages/llama/__init__.py'
with open(init_file_path, 'r') as file:
    print(file.read())
```

我在课程页面上执行一看，__init__.py 就只有一行：

```python
from lamini import *
```

这下我也看懂了。敢情课程用的这个 llama 就是套了个壳，本质上就是 lamini 这个库！

我把页面上的 `from llama import BasicModelRunner` 这行代码改成 `from lamini import BasicModelRunner` 再往下执行，丝毫没有影响。`BasicModelRunner` 的所有功能和之前一模一样。

ChatGPT 表示赞同，说这意味着 llama 实际上是导入并暴露了 lamini 包中的所有内容，本身可能不包含任何独立的代码或功能。这可能是为了向后兼容、重命名、或简化导入路径等目的。

最后它建议我查看 lamini 的功能和用途，说：“由于 lamini 似乎是 llama 的主要内容来源，了解 lamini 将是解开这个谜团的关键。”

还挺像那么回事儿，还“谜团的关键”。

然后我和 ChatGPT 就愉快地结束了这次利用 Jupyter 的漏洞对在线课程执行环境的探索。