---
layout: post
title: 关于ChatGPT替我写了一个Android程序的事
date: 2023-11-01 19:30:25
---

最近做了一个[Android+server的小项目](https://github.com/ZTGeng/My-TikTok){:target="_blank"}，可以像短视频app一样，再Android端浏览播放server上提供的视频，并且上传视频到server。

本身没什么亮点，功能简陋，界面粗糙，是个学习项目，没什么实际使用价值。

亮点在于，从开始的架构，到最终的代码，绝大部分是由ChatGPT完成的。

做这个的初衷是，作为一名安卓程序员，我想试试ChatGPT能在多大程度上取代我。

#### AI辅助编程的过程与技巧

分阶段向ChatGPT描述需求，由它提供代码。代码调试也尽量交给它。

这个过程中，逐渐发现了几个技巧：

1. **提纲式prompt，分支提问。**在最上方的prompt中提供项目的整体描述和规划，要求ChatGPT不要立即回答，而是在后续的对话中针对具体问题回答。例如：

<div class="small p-2">
<p class="p-2">
你是一个熟悉安卓和python的全栈工程师，擅长编写优雅、健壮的代码。你将创建一个可以播放在线视频的Android app和与之配合的后台服务器（使用flask）。你使用Intellij作为IDE。<br>
首先我们需要编写Android app，使用Kotlin。<br>
我将一步步列出需要进行的工作。这条消息只需回复“好的”。在之后的消息中我们将完成具体工作。
</p>
<p class="p-2 bg-light">
好的。
</p>
<p class="p-2">
首先我们需要设计所需的api，包括：<br>
1，获取视频列表，每次返回最多20条视频的id以及缩略图。注意app将使用瀑布流UI，当划到列表底部时，我们会再次通过此api获取后面20条视频的信息，因此该api需要使用参数来指定起始的视频编号。<br>
2，播放某一个id对应的视频。<br>
设计上面两个api及响应格式。<br>
另外，作为一个在线播放视频的app，暂不考虑用户注册和登录功能，我们还需要什么api？
</p>
<p class="p-2 bg-light">
首先，我们来设计上述的API。<br>
获取视频列表:<br>
Endpoint: /videos<br>
Method: GET<br>
Parameters:<br>
start: 起始的视频编号，默认为0<br>
limit: 返回的视频数量，默认为20<br>
……
</p>
</div>

这样做的好处是避免对话过长导致prompt超出字数限制，从而丢失上下文。当一个问题解决后，你可以通过修改问题的功能，在提纲prompt下面另起一个分支：

<div class="small p-2">
<p class="p-2">
你是一个熟悉安卓和python的全栈工程师，擅长编写优雅、健壮的代码。你将创建一个可以播放在线视频的Android app和与之配合的后台服务器（使用flask）。你使用Intellij作为IDE。<br>
首先我们需要编写Android app，使用Kotlin。<br>
我将一步步列出需要进行的工作。这条消息只需回复“好的”。在之后的消息中我们将完成具体工作。
</p>
<p class="p-2 bg-light">
好的。
</p>
<p class="p-2">
假设服务器已经布置完成，提供以下api：<br>
1，获取视频列表:<br>
……<br>
<br>
app需要以下功能：<br>
1，一个向右滑出的设置栏，其包含一个输入框用于手动输入服务器ip地址，并将其储存在本地。<br>
2，在app启动时检查是否存有ip地址，如果找到，自动连接服务器获取视频列表（应包含最少0个、最多20个视频的信息）。以每行2个的格式在主屏幕上显示其thumbnail。<br>
3，主屏幕使用瀑布流UI，当划到列表底部时，再次通过适当的参数获取后面20条视频的信息例如，假设主屏幕已经显示了20个视频，则下一次获取视频列表的url应该是：“/videos? start=20”。<br>
4，当点击某一个视频的thumbnail时，通过api “ /&lt;video_id>/play”播放该视频。<br>
根据以上功能，列出Android app需要包含哪些组件。<br>
</p>
<p class="p-2 bg-light">
根据您描述的功能，以下是Android app所需的组件：<br>
<br>
1. Activities & Fragments:<br>
MainActivity: 主屏幕，显示视频列表。<br>
VideoPlayerActivity: 用于播放选中的视频。<br>
SettingsFragment: 向右滑出的设置栏，用于输入服务器IP地址。<br>
<br>
2. Adapters:<br>
VideoListAdapter: 用于在MainActivity中显示视频列表的适配器。它将使用瀑布流布局（例如，使用RecyclerView与StaggeredGridLayoutManager）。<br>
<br>
3. Models:<br>
Video: 一个简单的数据类，包含视频的ID和缩略图URL。<br>
……
</p>
</div>

<ol start="2">
  <li><strong>迭代式提问。</strong>在ChatGPT回答了一个问题之后，根据它的答案修改你刚刚提的问题，而不是在它的答案下面继续提问。这样可以有效缩短prompt长度，避免对话丢失上下文。</li>
</ol>

例如，上面的对话中，ChatGPT给Android app规划了基本架构，列出了若干个类，如MainActivity等。于是我修改了我的问题：

<div class="small p-2">
<p class="p-2">
假设服务器已经布置完成，提供以下api：<br>
1，获取视频列表:<br>
……<br>
<br>
app包含以下组件：<br>
1，Activities & Fragments:<br>
 - MainActivity: 主屏幕，显示视频列表。<br>
 - VideoPlayerActivity: 用于播放选中的视频。<br>
 - SettingsFragment: 向右滑出的设置栏，用于输入服务器IP地址。<br>
2，Adapters:<br>
 - VideoListAdapter: 用于在MainActivity中显示视频列表的适配器。它将使用瀑布流布局（例如，使用RecyclerView与StaggeredGridLayoutManager）。<br>
……<br>
<br>
下面我们依次编写这些类。此条消息回复“好的”。之后的消息将会指定要编写的类。
</p>
<p class="p-2 bg-light">
好的。
</p>
<p class="p-2">
编写model类 Video
</p>
<div class="p-2 bg-light">
好的，我们从Video数据类开始。这是一个简单的Kotlin数据类，用于表示视频的基本信息。<br>
<pre><code>
data class Video(
    val id: String,
    val thumbnail: String
)
</code></pre>
……
</div>
</div>

通过不断修改之前的提问，确保只有对当前问题有用的信息包含在prompt中。

但是要注意，随着项目的逐步完成，需要在prompt中告诉**ChatGPT当前的进度，以避免它做重复的工作**。例如：

<div class="small p-2">
<p class="p-2">
app包含以下组件：<br>
……<br>
<br>
现在App已能正常工作。无需对功能进行调整。<br>
请问如何将MainActivity设置为只允许竖屏浏览？
</p>
</div>

<ol start="3">
  <li><strong>在prompt中包含相关信息。</strong>ChatGPT在某一个对话分支下时，其prompt并不包含其他对话分支下的讨论和代码，导致代码之间相互冲突，或功能重复。这时需要手动将它之前完成的代码补充进prompt，让新代码与已有的代码能相互配合。</li>
</ol>

<div class="small p-2">
<p class="p-2">
现有SettingsFragment类代码：<br>
<br>
import android.os.Bundle<br>
import androidx.preference.PreferenceFragmentCompat<br>
<br>
class SettingsFragment : PreferenceFragmentCompat() {<br>
……<br>
<br>
而其中用到的R.xml.preferences代码如下：<br>
<br>
&lt;?xml version="1.0" encoding="utf-8"?\><br>
&lt;PreferenceScreen xmlns:android="http://schemas.android.com/apk/res/android"\><br>
……<br>
<br>
根据上面已存在的代码，编写 AppPreferences 类
</p>
<div class="p-2 bg-light">
AppPreferences 类将用于存储和检索服务器的 IP 地址。我们将使用 SharedPreferences 来实现这个功能。以下是 AppPreferences 类的实现：<br>
<pre><code>
import android.content.Context
import android.content.SharedPreferences
import androidx.preference.PreferenceManager

class AppPreferences(context: Context) {

    private val preferences: SharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)

    companion object {
        private const val SERVER_IP_KEY = "server_ip"
        private const val DEFAULT_SERVER_IP = "192.168.1.1"
    }
</code></pre>
……
</div>
</div>

<ol start="4">
  <li><strong>提供示例代码。</strong>有一些新的技术出现较晚，不包含在ChatGPT的训练数据里。如果必须使用这些技术，ChatGPT在强制要求之下只会编造出虚假的使用代码。这种情况下，可以在prompt中提供该技术官方文档里的示例代码。ChatGPT只要一小段HelloWorld就能学会正确使用方法。</li>
</ol>

<ol start="2">
  <li><strong>较大的类，每次一个函数，多次完成。</strong>特别是像Android里的Activity类，涉及功能较多。ChatGPT在第一次生成代码时，一般会仅给出框架和最基本的功能。之后当需要增添新的函数时，只要在代码中留下“`// TODO: （功能描述）`”的注释，贴回prompt，让ChatGPT完成这个“TODO”即可。</li>
</ol>

#### AI的优势和局限

[整个项目](https://github.com/ZTGeng/My-TikTok){:target="_blank"}花了大约四五天。比我没有使用AI时的工作速度要快很多。

ChatGPT提供了Android端大约90%的代码，和server端99%的代码。对于这部分代码，我做的仅仅是复制粘贴。当然，我仍然需要完全理解这些代码，但是借助询问ChatGPT，做到完全理解不算很难。

比起具有复杂的项目结构、涉及众多Kotlin类和布局文件的Android项目，ChatGPT编写只有一两个python文件的server更加得心应手。短小紧凑的python代码更方便加入prompt，使代码生成过程更为顺滑。

代码调试阶段，ChatGPT可以解决Android端大约70%的bug；剩余30%还是依赖于程序员自身的能力。ChatGPT解决bug的能力，有时不仅依赖于prompt有没有包含足够的信息，而且受到提问侧重点的影响。

##### 案例

本项目中，ChatGPT对一个View加载的bug始终没有找到原因。事后证明此bug涉及ViewThumbnailView和item_video这两个文件。我翻查了与ChatGPT的交流过程，并引导它重新尝试解决bug：

1. 最初的debug讨论中，我的prompt贴出了包括ViewThumbnailView在内的多组代码，以及bug描述。ChatGPT没有找到原因，而是列出了数个调查方向。在后续提问中我又补充了item_video文件代码，至此prompt中已经有足够的信息供ChatGPT发现bug。但是它并没有找到问题根源，所提出的解决方案也并不能修复此bug。

<div class="small p-2">
<p class="p-2">
app包含以下组件：<br>
……<br>
<br>
其中MainActivity的代码为：<br>
……<br>
VideoThumbnailView的代码为：<br>
……<br>
VideoListAdapter的代码为：<br>
……<br>
<br>
当启动app时，尽管已经收到了包含20个Video的视频列表，但屏幕上没有视频被加载。debug发现：VideoListAdapter.onCreateViewHolder()方法被执行了1次，VideoListAdapter.onBindViewHolder()方法没有被执行。
</p>
<p class="p-2 bg-light">
从你提供的代码中，我发现了几个可能的问题。首先，我们来解决VideoListAdapter.onCreateViewHolder()被调用，但VideoListAdapter.onBindViewHolder()没有被调用的问题。<br>
<br>
1. 检查 RecyclerView 的高度：<br>
如果RecyclerView的高度为0或者它被其他视图遮挡，那么onBindViewHolder可能不会被调用。确保RecyclerView在布局中有足够的空间，并且没有被其他视图遮挡。<br>
2. 检查 RecyclerView 的 Adapter 数据：<br>
……<br>
3. 检查 LayoutManager：<br>
……<br>
4. 检查 Item 的高度：<br>
……
</p>
<p class="p-2">
关于Item的高度：以下是item_view.xml的代码：<br>
……
</p>
<p class="p-2 bg-light">
你的item_view.xml布局文件看起来是正常的。ImageView的高度被明确地设置为200dp，所以它不应该是问题的原因。<br>
<br>
但是，我注意到你在VideoListAdapter.onCreateViewHolder()中直接实例化了VideoThumbnailView，而没有使用LayoutInflater来从item_view.xml中加载布局。这可能是问题的原因。<br>
<br>
当你直接实例化VideoThumbnailView时，它可能没有正确地加载其内部的布局，导致onBindViewHolder没有被调用。<br>
……
</p>
</div>

<ol start="2">
  <li>Bug解决之后，考虑到之前的prompt中提供了很多冗余信息，且出问题的代码不是一次提供的，所以我模拟了当时的交流过程，修改了提问prompt，使其只包含相关代码和问题描述。ChatGPT仍然没有找到bug的问题根源，而是继续列出多个调查方向（而且由于prompt中的代码减少，调查的范围反而更宽了）：</li>
</ol>

<div class="small p-2">
<p class="p-2">
app包含以下组件：<br>
……<br>
<br>
其中VideoThumbnailView的代码为：<br>
……<br>
其加载的layout文件：item_video.xml的代码为：<br>
……<br>
VideoListAdapter的代码为：<br>
……<br>
<br>
当启动app时，尽管已经收到了包含20个Video的视频列表，但屏幕上没有视频被加载。debug发现：VideoListAdapter.onCreateViewHolder()方法被执行了1次，VideoListAdapter.onBindViewHolder()方法没有被执行。
</p>
<p class="p-2 bg-light">
如果 onCreateViewHolder() 被调用了，但 onBindViewHolder() 没有被调用，这通常意味着 RecyclerView 认为它没有任何数据来绑定到视图上。这可能是由几个原因造成的：<br>
<br>
1. 数据集为空：确保传递给 VideoListAdapter 的 videos 列表不是空的。<br>
2. RecyclerView的布局管理器：确保你的 RecyclerView 已经设置了一个布局管理器。如果没有布局管理器，RecyclerView 将不会知道如何排列其子视图。<br>
3. 适配器未正确连接：确保你已经将 VideoListAdapter 实例设置为 RecyclerView 的适配器。<br>
4. 数据集更改通知：如果数据在适配器创建后发生了更改，确保你调用了 notifyDataSetChanged() 或相关的通知方法来通知适配器数据已经更改。<br>
5. 视图尺寸问题：如果 item_video.xml 的布局有问题，例如高度设置为 wrap_content 但子视图没有固定高度或者是不可见的，那么 onBindViewHolder() 可能不会被调用，因为 RecyclerView 可能认为没有足够的空间来渲染任何内容。<br>
<br>
检查以下几点：<br>
<br>
· 确保 videos 列表在设置适配器之前已经被初始化并且包含数据。<br>
……<br>
· 检查 item_video.xml 的布局，确保它在 RecyclerView 中能够正确显示。<br>
<br>
如果以上都确认无误，那么可能需要更详细的调试来查看为什么 onBindViewHolder() 没有被调用。可以考虑打印日志或使用断点来检查 RecyclerView 的状态和 videos 列表的内容。
</p>
</div>

（其中第5点虽然与正确答案稍有接近，但仍然没有实际指出问题根源。）

<ol start="3">
  <li>在上一次尝试的基础上，我去掉了bug描述部分，明确地指出问题所在。这次ChatGPT终于找到了正确答案。</li>
</ol>

<div class="small p-2">
<p class="p-2">
app包含以下组件：<br>
……<br>
<br>
其中VideoThumbnailView的代码为：<br>
……<br>
其加载的layout文件：item_video.xml的代码为：<br>
……<br>
VideoListAdapter的代码为：<br>
……<br>
<br>
<strong>检查VideoThumbnailView的实例化和inflate过程是否有问题。</strong>
</p>
<p class="p-2 bg-light">
在VideoThumbnailView的Kotlin代码中，你已经正确地通过LayoutInflater加载了布局，并且初始化了thumbnailImageView。这是一个常见的做法来创建自定义视图。<br>
<br>
然而，有一点需要注意的是，你在XML布局文件中使用了自定义视图的完整类名作为根元素。这在某些情况下可能会导致问题，因为你已经在自定义视图的构造函数中加载了布局。这意味着布局可能会被加载两次，一次是在XML文件中指定的时候，另一次是在自定义视图的init块中。<br>
<br>
为了避免这个问题，你应该在XML文件中使用常规的布局组件（如FrameLayout, LinearLayout, RelativeLayout等）作为根元素，而不是自定义视图的类名。然后，你可以在自定义视图的init块中加载这个布局。<br>
……
</p>
</div>

对比第二次与第三次提问，ChatGPT进行推断所依据的代码信息是相同的，起作用的是我明确地要求它检查有问题的地方，相当于是把正确答案告诉它了。这在实际debug中是不太可能做到的。从ChatGPT在这个案例的表现来看，它对于涉及代码较广、隐藏较深的bug仍然比较棘手。

除了debug，其他ChatGPT不擅长、需要人为干预的工作集中在几个部分：

1. ChatGPT初次生成的代码，往往不够周密，藏有各种各样的bug隐患。熟练的程序员有时能够提前看出这些隐患，向ChatGPT指出问题、补充要求，从而减少了很多后续的工作。以下是一个典型的例子：

<div class="small p-2">
<p class="p-2">
app包含以下组件：<br>
……<br>
<br>
其中VideoThumbnailView的代码为：<br>
……<br>
<br>
请编写VideoListAdapter的onCreateViewHolder()方法。
</p>
<p class="p-2 bg-light">
为了完成onCreateViewHolder()方法，我们需要做以下几步：<br>
<br>
1. 使用LayoutInflater从XML布局文件中加载VideoThumbnailView。<br>
2. 使用加载的VideoThumbnailView创建一个新的VideoViewHolder实例。<br>
3. 返回这个新创建的VideoViewHolder实例。<br>
以下是VideoListAdapter中onCreateViewHolder()方法的实现：<br>
……
</p>
<p class="p-2">
注意VideoThumbnailView在init时也会inflate自身。这与你在onCreateViewHolder中的代码是否会冲突？
</p>
<p class="p-2 bg-light">
对，你提到了一个很好的点。由于VideoThumbnailView在其构造函数中已经执行了inflate操作，我们不应该再次在onCreateViewHolder中进行inflate。否则，会导致布局层次不正确，因为我们实际上会得到一个嵌套的VideoThumbnailView。<br>
<br>
为了解决这个问题，我们应该直接创建VideoThumbnailView的实例，而不是再次从XML布局文件中加载它。<br>
<br>
以下是修正后的onCreateViewHolder()方法：<br>
……
</p>
</div>

从这个意义上说，尽管ChatGPT提供了90%的代码，但并不能认为它完成了90%的工作。程序员作为AI代码的审核者，实际上在提高效率、减少无用功上面发挥了作用。尽管在AI与人类的结对编程中，绝大多数时候是人类在问、AI在答，但是二者的角色定位应该是人类为导师，AI为学徒。AI回答人类的提问体现了它作为工具的一面。它具备比人类渊博的知识，但它不能监管指导人类的编程工作，相反，它的代码需要人类去审核验收。

<ol start="2">
  <li>由于对话分支导致prompt信息不完整，从而引发的代码冲突、重复或缺失。这一问题并不严重，它产生的bug往往非常明显，在对话阶段就会被发现和纠正。通过在prompt中补充相关代码也可以有效避免。例如当它分别生成Activity和layout的代码时，有时Activity会引用layout不存在的id，或者layout上的组件不能与Activity功能相配合。</li>
  <li>UI和产品需求的细节部分，ChatGPT的效率往往不如人类。这并不是由于ChatGPT无法实现细枝末节的需求，而是因为这类需求要求详尽、反复的沟通，不断修改prompt重新提问。同样的时间也许人类程序员早就自行完成需求了。这个问题并不在AI这一边，而是出在沟通环节。它也将随着prompt工程的发展、AI交互能力的强大而得到解决。</li>
  <li>与编程规范、代码风格相关的工作，比如接口设计、各种命名等。</li>
</ol>

**最后，ChatGPT能够取代我吗？**

现在当然还不能。

未来，也许是很近的未来，世界也许不再需要一个Android程序员。

但是，肯定会需要一个指导、审核ChatGPT进行Android编程的人类。