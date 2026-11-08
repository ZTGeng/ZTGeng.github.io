# 卡农曲目数据

## 两只老虎（tigers）

- `tigers.json`：供后续音符绘制、音频调度和曲库读取的主数据。
- `tigers.abc`：同一旋律的可读 ABC 乐谱，便于人工校对；不包含歌词或和弦。
- C 大调，4/4，八小节、32 拍、32 个音符，音域 G3～A4。中央 C 使用 C4 / MIDI 60。
- 完整主旋律仅陈述一遍。保留旋律内部本来就有的成对乐句，不添加整曲反复、轮唱声部、前奏、伴奏或尾奏。
- 四分音符为一拍；`startBeat` 从 0 开始，`durationBeats` 表示谱面时值，不含播放中的音符间隙。默认四分音符速度 100 BPM，整曲一遍为 19.2 秒；实际播放倍率由全局控制。
- 数据不包含歌词；`hasLyrics: false` 为素材属性。`kind` 和 `display` 独立声明素材与显示类型。

### 核对来源与处理

1. [Porte-Notes 单声部完整 ABC 曲谱](https://portenotes.lacultureataporte.fr/composition/repertoire/frere-jacques)：提供 F 大调、4/4 的完整八小节音高与节奏，标注传统公版旋律、四分音符速度 100。将其整体降低五个半音，得到本项目的 C 大调版本。
2. [Online Piano Keyboard 的 C 大调曲谱及音名](https://onlinepianokeyboard.com/songs/frere-jacques)：交叉核对 C4 起音、末两小节的低音 G3，以及第 5～6 小节的四个八分音符和随后两个四分音符。

核对日期：2026-11-05。来源页面注明旋律为 public domain；本项目只重新录入传统主旋律的音高与时值，不复制网页排版、谱面图片、录音或音色采样。

### 后续接入约定

工作台直接导入 `tigers.json`，以 `barCount` 确定音轨长度，并由同一份 `notes` 数据绘制音符和调度声音。默认第二个声部从第 3 小节开始。

声部引用同一曲目，独立保存进入小节与音量；不得在曲目文件中预先复制轮唱声部。起音秒数为 `startBeat * 60 / tempoBpm / globalRate`，时值秒数同理；声部进入偏移由播放层另行加入。

## 哥德堡变奏曲第三变奏（goldberg-variation-3）

- 作者为约翰·塞巴斯蒂安·巴赫。JSON 与 ABC 均由用户提供的修正版 `goldberg_variation3_violin_verified.csv` 转写。JSON 记录源文件摘要供核对。
- 原谱为 12/8 拍，一个升号，16 小节，179 个谱面音符、12 个休止符和 16 处延音线。ABC 用 `z` 记休止、用 `-` 记延音线。JSON 用音符间隔保留休止，并把延音线相连的同音合并为一次起音，共 163 个播放音符。
- CSV 的 `beat` 与 `duration_quarters` 以四分音符为单位。每小节占 6 个这样的单位，时间轴按 4 个附点四分音符拍划分。默认速度为四分音符 96 BPM。
- 第 1–8 小节和第 9–16 小节各奏两遍。原始 JSON 保留 16 小节与反复范围，播放与音轨按 1–8、1–8、9–16、9–16 的顺序展开为 32 小节。第二声部和新增声部默认比上一声部晚一个小节。

## 接入录音曲目

先确定可使用的单声部录音和固定节拍的裁切段，从第一个完整小节的起点取样。开发机需要 FFmpeg。以下命令为原速 100 BPM、4/4、八小节的示例，`12.5` 是源文件内裁切起点的秒数。

```powershell
node scripts/prepare-canon-recording.js input.wav src/chapters/00-intro/bach/pieces/recordings/dona 100 8 12.5 4
```

输出包含七档 WAV、按原速录音采样的波形和 `recording.json`。目录名对应曲库 ID（`yellow-river`、`crab`、`dona`）。把来源和授权记录在曲目目录，补齐谱面信息。存在已核对的歌词时，将 `hasLyrics` 设为 `true`，并填入 `lyrics`，每条记录包含 `text`、`startBeat`、`durationBeats`。这些时间使用原速曲目的拍坐标。

工作台通过 Vite 收录录音文件。每档录音在首次播放时加载和解码，所有声部共享同一份解码数据。录音长度应和 `durationBeats * 60 / tempoBpm / rate` 一致。脚本当前适用于固定节拍、四分音符计拍的片段。弱起、变拍和非等速录音的节拍对齐需按实际素材另行处理。
