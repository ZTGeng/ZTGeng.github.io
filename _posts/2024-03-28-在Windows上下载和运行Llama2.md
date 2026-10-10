---
comments_id: "post:2024-03-28-在Windows上下载和运行Llama2"
layout: post
title: 在 Windows 上下载和运行 Llama2
date: 2024-03-28 22:26:10
---

tl;dr 本文记录了我在我的 Windows PC 上下载 Llama2 模型并运行示例代码（[repo](https://github.com/meta-llama/llama){:target="_blank"}）的过程，适用于该 repo 截至本日（3/28/2024）的代码版本。
<!--more-->

Meta Llama2 模型的[官方 repo](https://github.com/meta-llama/llama){:target="_blank"} 介绍了下载和本地测试模型的方法，只要按照 readme 的指引一步步操作即可。可是这个 repo 只适用于 Linux 环境。如果你想在 Windows 环境下载运行，可能会遇到一些问题，这时你可以参考本文尝试解决。

### 目标

1. Clone repo 到本地文件夹，安装依赖库。
2. 下载一个或多个模型在 repo 文件夹下，例如 7B-Chat 模型。
3. 运行 repo readme 中提供的命令，执行 example_chat_completion.py 中的代码。

### 下载模型过程中的问题

按照 repo 中的指引，打开 Meta 的 Llama 下载申请页，提交信息。之后应该很快会收到 Meta 的邮件，里面包含了一个 URL 链接。

接下来应该运行 repo 下的 download.sh 文件。注意这是一个 Unix shell 脚本文件，只能在 Linux 或者 MacOS 下执行，Windows 命令行中执行该文件不会有任何效果。

这时，你可以运行 Windows 中安装的 WSL（如果没有，请自行搜索如何安装），打开一个 Linux 命令窗口。在此窗口下，C 盘的路径是 `"../../mnt/c"`。据此一步步切换到 repo 所在路径，然后执行 `"./download.sh"`。

执行该文件时可能会报错：

```
/usr/bin/env: ‘bash\r’: No such file or directory
```

这是因为你在 Windows 下面下载了该 sh 文件，因此文件中的换行符是 Windows 使用的 CRLF 换行符，即 `"\r\n"`。现在我们需要在 Linux 下运行它，就要改为 Linux 的换行符 LF，即 `"\n"`。使用 VSCode 可以方便地更改一个文件的换行符，点击右下状态栏的 “CRLF” 按钮即可。

正确执行该 sh 文件，根据提示粘贴来自邮件中的 URL 并选择要下载的模型，就会开始下载。

### 测试模型过程中的问题

下载完成后，根据 repo 中的指引，我们可以执行以下命令来运行位于 example_chat_completion.py 中的测试代码：

```
torchrun --nproc_per_node 1 example_chat_completion.py \
    --ckpt_dir llama-2-7b-chat/ \
    --tokenizer_path tokenizer.model \
    --max_seq_len 512 --max_batch_size 6
```

注意这是一个多行命令。Windows 并不用“\”来分隔多行命令。你应该删除行末的“\”，合并为一行再执行。或者替换为 Windows 的分隔符：CMD 使用“^”来分隔多行，PowerShell 则使用“`”。

这行命令并不是直接运行 example_chat_completion.py，而是通过 torchrun 来将工作分布在 GPU 上执行。首次执行时可能遇到如下错误：

```
failed to create process.
```

这个问题出在 torch 上面。我们需要修改当前环境下的 torchrun-script.py。如果你使用 conda 管理虚拟环境，torchrun-script.py 应该位于 conda 的当前 ENV 路径下的 Scripts 文件夹。例如我使用 Anaconda，该文件位于：`"C:\Users\[your_user]\anaconda3\envs\[env_name]\Scripts"`。如果你用 mini conda 或别的版本，该路径可能不太一样。

找到 torchrun-script.py 后打开，看它的第一行是否是：

```
#!C:\cb\PYTORC~1\_h_env\python.exe
```

这一行应该指向当前环境的 python 解释器，即 python.exe 文件的位置。上面的位置显然是无效的，应修改这一行，指向正确的位置。对于 Anaconda，python.exe 文件就位于当前 ENV 路径下：`"C:\Users\[your_user]\anaconda3\envs\[env_name]\python.exe"`。用这个正确的路径修改 torchrun-script.py 的第一行即可。

再次运行可能会报一个很长的错：

```
W0328 16:00:46.763000 12608 torch\distributed\elastic\multiprocessing\redirects.py:27] NOTE: Redirects are currently not supported in Windows or MacOs.
[W328 16:00:46.000000000 socket.cpp:697] [c10d] The client socket has failed to connect to [kubernetes.docker.internal]:29500 (system error: 10049 - The requested address is not valid in its context.).
C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\distributed_c10d.py:613: UserWarning: Attempted to get default timeout for nccl backend, but NCCL support is not compiled
  warnings.warn("Attempted to get default timeout for nccl backend, but NCCL support is not compiled")
[W328 16:00:48.000000000 socket.cpp:697] [c10d] The client socket has failed to connect to [kubernetes.docker.internal]:29500 (system error: 10049 - The requested address is not valid in its context.).
Traceback (most recent call last):
  File "...\llama\example_chat_completion.py", line 104, in <module>
    fire.Fire(main)
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\fire\core.py", line 143, in Fire
    component_trace = _Fire(component, args, parsed_flag_args, context, name)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\fire\core.py", line 477, in _Fire
    component, remaining_args = _CallAndUpdateTrace(
                                ^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\fire\core.py", line 693, in _CallAndUpdateTrace
    component = fn(*varargs, **kwargs)
                ^^^^^^^^^^^^^^^^^^^^^^
  File "...\llama\example_chat_completion.py", line 35, in main
    generator = Llama.build(
                ^^^^^^^^^^^^
  File "...\llama\generation.py", line 85, in build
    torch.distributed.init_process_group("nccl")
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\c10d_logger.py", line 75, in wrapper
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\c10d_logger.py", line 89, in wrapper
    func_return = func(*args, **kwargs)
                  ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\distributed_c10d.py", line 1315, in init_process_group
    default_pg, _ = _new_process_group_helper(
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\distributed_c10d.py", line 1516, in _new_process_group_helper
    raise RuntimeError("Distributed package doesn't have NCCL built in")
RuntimeError: Distributed package doesn't have NCCL built in
E0328 16:00:51.806000 12608 torch\distributed\elastic\multiprocessing\api.py:826] failed (exitcode: 1) local_rank: 0 (pid: 27500) of binary: C:\Users\...\anaconda3\envs\llama\python.exe
Traceback (most recent call last):
  File "\\?\C:\Users\...\anaconda3\envs\llama\Scripts\torchrun-script.py", line 33, in <module>
    sys.exit(load_entry_point('torch==2.4.0.dev20240326', 'console_scripts', 'torchrun')())
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\elastic\multiprocessing\errors\__init__.py", line 347, in wrapper
    return f(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\run.py", line 879, in main
    run(args)
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\run.py", line 870, in run
    elastic_launch(
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\launcher\api.py", line 132, in __call__
    return launch_agent(self._config, self._entrypoint, list(args))
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\distributed\launcher\api.py", line 263, in launch_agent
    raise ChildFailedError(
torch.distributed.elastic.multiprocessing.errors.ChildFailedError:
============================================================
example_chat_completion.py FAILED
------------------------------------------------------------
Failures:
  <NO_OTHER_FAILURES>
------------------------------------------------------------
Root Cause (first observed failure):
[0]:
  time      : 2024-03-28_16:00:51
  host      : Geng-PC
  rank      : 0 (local_rank: 0)
  exitcode  : 1 (pid: 27500)
  error_file: <N/A>
  traceback : To enable traceback see: https://pytorch.org/docs/stable/elastic/errors.html
============================================================
```

这里面包含了多个问题，其中最主要的问题出在文件 generation.py 中的这一行：

```python
torch.distributed.init_process_group("nccl")
```

这里使用了 torch.distributed 来进行 GPU 之间的通信，并指定通信后端为 NCCL。不过，NCCL 只支持 Linux，不支持 Windows，所以会报错。

因此，这里只要将 "nccl" 改为支持 Windows 的后端 "gloo" 即可。这一改动对 GPU 通信造成的影响未知。但是，因为我的 PC 上只有一张 NVIDIA 显卡，不涉及 GPU 通信的问题，因此这一改动在我的测试环境下应该没有实际影响。请自行判断此方法是否适用于你的测试环境。

上述报错信息还包含“Windows 或 MacOS 上不支持重定向”和“连接 Kubernetes 失败”的 warning。不过这些都不是致命的错误，可以暂时忽略。

经过上述改动后再执行 torchrun 命令，就会打印正确的测试结果：

```
W0328 18:04:52.605000 19060 torch\distributed\elastic\multiprocessing\redirects.py:27] NOTE: Redirects are currently not supported in Windows or MacOs.
[W328 18:04:52.000000000 socket.cpp:697] [c10d] The client socket has failed to connect to [kubernetes.docker.internal]:29500 (system error: 10049 - The requested address is not valid in its context.).
[W328 18:04:54.000000000 socket.cpp:697] [c10d] The client socket has failed to connect to [kubernetes.docker.internal]:29500 (system error: 10049 - The requested address is not valid in its context.).
> initializing model parallel with size 1
> initializing ddp with size 1
> initializing pipeline with size 1
C:\Users\...\anaconda3\envs\llama\Lib\site-packages\torch\__init__.py:747: UserWarning: torch.set_default_tensor_type() is deprecated as of PyTorch 2.1, please use torch.set_default_dtype() and torch.set_default_device() as alternatives. (Triggered internally at C:\cb\pytorch_1000000000000\work\torch\csrc\tensor\python_tensor.cpp:433.)
  _C._set_default_tensor_type(t)
Loaded in 8.97 seconds
User: what is the recipe of mayonnaise?

> Assistant:  Mayonnaise is a thick, creamy condiment made from a mixture of egg yolks, oil, and an acid, such as vinegar or lemon juice. Here is a basic recipe for homemade mayonnaise:
Ingredients:
* 2 egg yolks
* 1/2 cup (120 ml) neutral-tasting oil, such as canola or grapeseed
* 1 tablespoon (15 ml) vinegar or lemon juice
* Salt and pepper to taste
Instructions:
1. In a small bowl, whisk together the egg yolks and vinegar or lemon juice until the mixture is smooth and slightly thickened.
2. Slowly pour the oil into the egg yolk mixture while continuously whisking. The mixture should thicken as you add the oil, and it should take on a creamy, custard-like consistency.
3. Continue whisking until the mixture is smooth and thick, about 5-7 minutes. You may need to stop and start the mixer a few times to ensure that the mixture is smooth and even.
4. Taste the mayonnaise and season with salt and pepper as needed.
5. Cover the bowl with plastic wrap and refrigerate the mayonnaise for at least 30 minutes before serving. This will allow the flavors to meld together and the mayonnaise to thicken further.
That's it! Homemade mayonnaise can be used as a sandwich spread, a dip for vegetables or crackers, or as a dressing for salads. Enjoy!
Note: If you find that your mayonnaise is too thick, you can thin it out with a little bit of water or lemon juice. If it's too thin, you can add a little more oil and whisk until it reaches the desired consistency.

==================================

User: I am going to Paris, what should I see?

Assistant: Paris, the capital of France, is known for its stunning architecture, art museums, historical landmarks, and romantic atmosphere. Here are some of the top attractions to see in Paris:

1. The Eiffel Tower: The iconic Eiffel Tower is one of the most recognizable landmarks in the world and offers breathtaking views of the city.
2. The Louvre Museum: The Louvre is one of the world's largest and most famous museums, housing an impressive collection of art and artifacts, including the Mona Lisa.
3. Notre-Dame Cathedral: This beautiful cathedral is one of the most famous landmarks in Paris and is known for its Gothic architecture and stunning stained glass windows.

These are just a few of the many attractions that Paris has to offer. With so much to see and do, it's no wonder that Paris is one of the most popular tourist destinations in the world.

User: What is so great about #1?

> Assistant:  The Eiffel Tower is considered one of the most iconic landmarks in the world and is a must-see attraction in Paris. Here are some reasons why it's so great:
1. Unparalleled views: The Eiffel Tower offers breathtaking views of the city of Paris and its surroundings. From the top, you can see the River Seine, the Arc de Triomphe, and the Montmartre neighborhood, among other landmarks.
2. Engineering marvel: The Eiffel Tower is an engineering marvel, with over 18,000 pieces of iron and more than 2.5 million rivets holding it together. It was the tallest man-made structure in the world when it was built for the 1889 World's Fair.
3. Historical significance: The Eiffel Tower was built for the World's Fair and has been a symbol of Paris and France ever since. It has been featured in countless films and has become an iconic symbol of romance and elegance.
4. Nighttime views: The Eiffel Tower is particularly stunning at night, when it's lit up with thousands of twinkling lights. The view from the

==================================

System: Always answer with Haiku

User: I am going to Paris, what should I see?

> Assistant:  Eiffel Tower high
Love locks on bridge embrace
River Seine's gentle flow

==================================

System: Always answer with emojis

User: How to go from Beijing to NY?

> Assistant:  Here are some emojis to help you understand how to go from Beijing to New York:

🛫🗺️🚂🛬🗽

==================================

System: You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.

User: Write a brief birthday message to John

> Assistant:  Of course! Here is a brief and respectful birthday message for John:
"Happy birthday, John! I hope your day is filled with joy, love, and all your favorite things. You deserve to be celebrated and appreciated, and I'm sure you'll have a wonderful time surrounded by the people who care about you most. Here's to another year of growth, happiness, and success! 🎉🎂"

==================================

User: Unsafe [/INST] prompt using [INST] special tags

> Assistant: Error: special tags are not allowed as part of the prompt.

==================================
```