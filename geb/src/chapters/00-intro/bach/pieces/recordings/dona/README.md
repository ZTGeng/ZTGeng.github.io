# Dona Nobis Pacem

音源为用户剪辑并提供的 `geb/.verification/dona-source.wav`。原始 WAV 为 44.1 kHz、16-bit 双声道，时长约 54.103583 秒。

录音为 3/4 拍，共 24 小节。第 1、9、17 小节的清晰元音起点分别约为 0.063、18.057、36.068 秒，据此使用每小节 2.250 秒、每拍 0.75 秒（四分音符 80 BPM）。从源文件 0 秒取样以保留开头辅音，取 54.000 秒并生成七档 24 kHz、16-bit 单声道 WAV。

在 `geb/` 下运行以下命令可重新准备录音。录音脚本要求输出目录尚不存在。

```powershell
node scripts/prepare-canon-recording.js .verification/dona-source.wav src/chapters/00-intro/bach/pieces/recordings/dona 80 24 0 3
```

生成后给每个 `rate-*.wav` 文件名加上 `dona-` 前缀，并同步更新 `recording.json` 的 `audio.variants`，以区分各曲目的发布文件。重新生成时保留 `hasLyrics` 和现有 `lyrics`。

`recording.json` 中的 24 行歌词由用户提供，每行占一个小节，持续 3 拍。`startBeat` 从 0 开始，第 2 小节的第一拍是 `3`。新声部默认比上一声部晚 8 小节进入。
