# 保卫黄河

音源为用户剪辑并提供的 `geb/.verification/yellow-river-source.wav`。原始 WAV 有 1,046,020 个采样帧，采样率为 44,100 Hz，时长约 23.719274 秒。

按用户给出的 2/4 拍与 31 小节，从 0 秒起等分整段。每小节约 0.765138 秒，每拍约 0.382569 秒，工作台使用的等效速度为 156.834477 BPM。这是用于对齐时间轴的平均速度。

使用 `scripts/prepare-canon-recording.js` 生成 24 kHz、16-bit 单声道 WAV。变速档使用 FFmpeg `atempo`，波形来自原速片段。

```powershell
node scripts/prepare-canon-recording.js .verification/yellow-river-source.wav src/chapters/00-intro/bach/pieces/recordings/yellow-river 156.83447735224948 31 0 2
```
