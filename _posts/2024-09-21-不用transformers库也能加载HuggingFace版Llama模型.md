---
layout: post
title: 不用transformers库也能加载HuggingFace版Llama模型
date: 2024-09-21 00:33:12
---

下载Llama模型有很多渠道。

第一种方法是通过HuggingFace的transformers库，使用`AutoModel`类加载：
<!--more-->

```python
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
)

model_name = "meta-llama/Meta-Llama-3.1-8B"

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map='auto',
)
```

第二种方法是通过[Meta的官方repo](https://github.com/meta-llama/llama-models){:target="_blank"}下载模型。首先clone这个repo，然后在Linux下运行里面的一个`.sh`文件（Windows的话可以在WSL下运行），就会开始下载。

第一种方法会把模型下载到Windows的`.cache`缓存文件夹，下载的模型权重是一些`.safetensors`文件，这是HuggingFace自己的文件格式。模型实现和推理的代码也都是transformers库提供的，也就是HuggingFace自己写的。

第二种方法要自己指定下载位置，权重文件的格式是`.pth`文件。不需要transformers库。Meta自己提供了一个轻量级的模型实现，在repo里`models/llama3/reference_impl/`路径下。代码很简单，功能也比较少。相反transformers里面的代码就很复杂，功能多，但阅读起来很晕很上头。

那么我们就会问：两种方法所下载的其实是一个东西，就是Llama模型的预训练参数。如果我们已经通过transformers下载了模型，然后想用Meta官方repo里的代码运行它，同时避免重复下载，这可以做到吗？

试了一下是可以的。需要一定的步骤。

首先要找到HuggingFace版模型的下载位置。比如Llama 3.1 8B模型，在我的本地储存在：`C:/Users/[user name]/.cache/huggingface/hub/models--meta-llama--Meta-Llama-3.1-8B/snapshots/[hash id]/`这个文件夹下。里面有4个`.safetensors`文件，大小一共约15G。除此之外还有一些配置文件等。

接下来我们clone上面那个Meta的官方repo。我们不会运行里面和下载有关的代码，只会用到模型构建相关的代码。

接着需要加载tokenizer。官方repo里使用的tokenizer是通过一个`tokenizer.model`文件加载起来的，HuggingFace版的模型里不包含这个文件，而是用一个转化后的`.json`文件来加载。我没有办法从json文件还原回`tokenizer.model`。幸好官方repo本来就包含了`tokenizer.model`，位于`models/llama3/api/`路径下面。`Tokenizer`这个类也定义在这个路径下。

假设我们在repo的根目录下建了一个`.ipynb`文件，在里面使用代码：

```python
from models.llama3.api import Tokenizer

tokenizer_path = "models/llama3/api/tokenizer.model"
tokenizer = Tokenizer(model_path=tokenizer_path)
```

或者更简单地

```python
tokenizer = Tokenizer.get_instance()
```

就获取了tokenizer。

加载模型分成两步：一是构建Llama模型，初始化每一层的权重矩阵；二是读取预训练权重文件，将数据赋值给构建的模型。

按照官方代码，先创建一个`ModelArgs`实例，然后就可以构建模型：

```python
from models.llama3.reference_impl.model import Transformer
from models.llama3.api import ModelArgs

model_args = ModelArgs()
model_args.vocab_size = tokenizer.n_words

model = Transformer(model_args).to('cuda')
```

最后的`Transformer`就是Llama模型在官方版本的实现里最外层的类名。

但是这样构建的模型有很多问题，需要对代码进行修改。

先说两个小问题：

1. 默认情况下，模型会使用float32作为权重数据类型，每个参数占据4个字节，这会让模型占用太多的显存。Huggingface的`AutoModel`允许你在参数中指定数据类型，但是Meta官方repo的实现并没有提供这个功能。所以你需要手动设置数据类型来减小模型规模。

```python
torch.set_default_dtype(torch.bfloat16)
```

2. 官方repo模型使用fairscale来实现分布式计算，从而支持多张显卡。这个本来没什么问题，我只有一张显卡也不影响使用。但是我不想安装fairscale，明明用不到，还看着它闹心。所以我从`models/llama3/reference_impl/model.py`文件里把fairscale的引用都删了。原本使用了fairscale创建的神经网络层，我全部替换成了`torch.nn`下面的类：

- `Transformer`下面有一个`VocabParallelEmbedding`，可以换成`nn.Embedding`。
- 其他那些`ColumnParallelLinear`和`RowParallelLinear`统统换成`nn.Linear`。
- 多余的参数也可以删掉，留下和矩阵规模相关的参数以及`bias=False`参数就可以。

上面两点可做可不做，但是下面的问题就必须解决了：

3. 此时如果我们打印一下生成的模型，会看到它是这个结构：

```
Transformer(
  (tok_embeddings): Embedding(128256, 4096)
  (layers): ModuleList(
    (0-31): 32 x TransformerBlock(
      (attention): Attention(
        (wq): Linear(in_features=4096, out_features=4096, bias=False)
        (wk): Linear(in_features=4096, out_features=4096, bias=False)
        (wv): Linear(in_features=4096, out_features=4096, bias=False)
        (wo): Linear(in_features=4096, out_features=4096, bias=False)
      )
      (feed_forward): FeedForward(
        (w1): Linear(in_features=4096, out_features=11008, bias=False)
        (w2): Linear(in_features=11008, out_features=4096, bias=False)
        (w3): Linear(in_features=4096, out_features=11008, bias=False)
      )
      (attention_norm): RMSNorm()
      (ffn_norm): RMSNorm()
    )
  )
  (norm): RMSNorm()
  (output): Linear(in_features=4096, out_features=128256, bias=False)
)
```

但是HuggingFace版的模型结构实际上是这样的：

```
LlamaForCausalLM(
  (model): LlamaModel(
    (embed_tokens): Embedding(128256, 4096)
    (layers): ModuleList(
      (0-31): 32 x LlamaDecoderLayer(
        (self_attn): LlamaSdpaAttention(
          (q_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (k_proj): Linear(in_features=4096, out_features=1024, bias=False)
          (v_proj): Linear(in_features=4096, out_features=1024, bias=False)
          (o_proj): Linear(in_features=4096, out_features=4096, bias=False)
          (rotary_emb): LlamaRotaryEmbedding()
        )
        (mlp): LlamaMLP(
          (gate_proj): Linear(in_features=4096, out_features=14336, bias=False)
          (up_proj): Linear(in_features=4096, out_features=14336, bias=False)
          (down_proj): Linear(in_features=14336, out_features=4096, bias=False)
          (act_fn): SiLU()
        )
        (input_layernorm): LlamaRMSNorm((4096,), eps=1e-05)
        (post_attention_layernorm): LlamaRMSNorm((4096,), eps=1e-05)
      )
    )
    (norm): LlamaRMSNorm((4096,), eps=1e-05)
    (rotary_emb): LlamaRotaryEmbedding()
  )
  (lm_head): Linear(in_features=4096, out_features=128256, bias=False)
)
```

对比一下就会发现几个问题：

- 几乎所有网络层的命名都不一样。在给权重矩阵赋值的时候是根据网络层的命名寻找对应的参数的。如果命名不一致就找不到参数。此外模型结构也有少量差异，这同样会影响命名。
- 一部分矩阵的规模不一致，主要涉及自注意力模型中的wk和wv这两层，以及FeedForward模型中的全连接层。必须完全一致才能赋值。
- HuggingFace版在每个自注意力模型下面都有一个额外的LlamaRotaryEmbedding层，这个倒不是问题，是历史遗留代码，不影响。

对于矩阵规模，关键是要在构建模型时传入正确的参数。Meta官方版的模型是通过一个`params.json`文件来提供这些参数的。HuggingFace版也提供了同样的参数，但是格式有差异。所以最简单的办法是从网上找一份官方版模型的`params.json`文件，把它的内容手动粘贴到代码里：

```python
params = {
    "dim": 4096, 
    "ffn_dim_multiplier": 1.3, 
    "multiple_of": 1024, 
    "n_heads": 32, 
    "n_kv_heads": 8, 
    "n_layers": 32, 
    "norm_eps": 1e-05, 
    "rope_theta": 500000.0, 
    "use_scaled_rope": True, 
    "vocab_size": 128256
}
model_args = ModelArgs(**params)

model = Transformer(model_args).to('cuda')
```

这样构建的模型就会包含正确的矩阵规模：wk和wv层的规模是(4096, 1024)，FeedForward层的矩阵规模是(4096, 14336)或(14336, 4096)。

而结构和命名就必须手动修改`models/llama3/reference_impl/model.py`文件。以下举其中一处修改作为例子：

在Attention这个类下面本来有这样的代码：

```python
self.wq = ColumnParallelLinear(
    args.dim,
    args.n_heads * self.head_dim,
    bias=False,
    gather_output=False,
    init_method=lambda x: x,
)
```

替换fairscale的类，按照HuggingFace版模型修改命名，代码变为：

```python
self.q_proj = nn.Linear(
    args.dim,
    args.n_heads * self.head_dim,
    bias=False,
)
```

每一层都要改用HuggingFace模型的命名。正确的命名可以在HuggingFace模型的下载文件夹下面，找`model.safetensors.index.json`这个文件，打开查看。

模型结构方面需要修改的是：HuggingFace版在最外层模型下面有一个叫做model的子模型，和lm_head输出层是并列的。而官方版最外层下面是嵌入层、自注意力层、归一化层和输出层相互并列。

```python
class Transformer(nn.Module):
    def __init__(self, params: ModelArgs):
        super().__init__()
        self.params = params
        self.vocab_size = params.vocab_size
        self.n_layers = params.n_layers

        self.tok_embeddings = nn.Embedding(
            params.vocab_size, params.dim
        )

        self.layers = torch.nn.ModuleList()
        for layer_id in range(params.n_layers):
            self.layers.append(TransformerBlock(layer_id, params))

        self.norm = RMSNorm(params.dim, eps=params.norm_eps)
        self.output = nn.Linear(
            params.dim, params.vocab_size, bias=False
        )
```

所以需要创建一个新的子类，把除了输出层以外的部分包起来。顺便把每层的命名改过来。

```python
class LlamaModel(nn.Module):
    def __init__(self, params: ModelArgs):
        super().__init__()

        self.embed_tokens = nn.Embedding(params.vocab_size, params.dim)

        self.layers = torch.nn.ModuleList()
        for layer_id in range(params.n_layers):
            self.layers.append(TransformerBlock(layer_id, params))

        self.norm = RMSNorm(params.dim, eps=params.norm_eps)

        self.freqs_cis = precompute_freqs_cis(
            params.dim // params.n_heads,
            params.max_seq_len * 2,
            params.rope_theta,
            params.use_scaled_rope,
        )

class Transformer(nn.Module):
    def __init__(self, params: ModelArgs):
        super().__init__()
        self.params = params
        self.vocab_size = params.vocab_size
        self.n_layers = params.n_layers

        self.model = LlamaModel(params)
        self.lm_head = nn.Linear(params.dim, params.vocab_size, bias=False)
```

最后输出的模型结构和HuggingFace版一致就可以。

到这一步终于可以赋值了。首先我们列出`.safetensors`文件的列表，然后依次读取数据：

```python
import os, gc
from safetensors.torch import load_file

folder = "C:/Users/.../.cache/huggingface/hub/models--meta-llama--Meta-Llama-3.1-8B/snapshots/..."
shard_files = [
    "model-00001-of-00004.safetensors", 
    "model-00002-of-00004.safetensors", 
    "model-00003-of-00004.safetensors", 
    "model-00004-of-00004.safetensors"
]

for shard_file in shard_files:
    path = os.path.join(folder, shard_file)
    state_dict = load_file(path)
    model.load_state_dict(state_dict, strict=False)

    del state_dict
    gc.collect()
```

这样模型就加载了预训练的参数，可以用于推理、微调等任务了。