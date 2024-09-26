---
layout: subindex

web-title:
  - lang: "en"
    content: "Games"
  - lang: "zh"
    content: "游戏"
title:
  - lang: "en"
    content: "Barebones Games"
  - lang: "zh"
    content: "朴素游戏"
greeting:
  - lang: "en"
    content: "This shows what the game looks like when made in the absence of a designer."
  - lang: "zh"
    content: "这里展示了设计师缺席的情况下做出的游戏是什么样子。"

active-tab: "games"
lang-enabled: true

catalogs:
  - id: "boardgames"
    title:
      - lang: "en"
        content: "Board Games"
      - lang: "zh"
        content: "棋类"
    items:
      - id: "gomoku"
        title:
          - lang: "en"
            content: "Gomoku"
          - lang: "zh"
            content: "五子棋"
        intro:
          - lang: "en"
            content: "15x15 board. Two-player game. No forbidden moves."
          - lang: "zh"
            content: "15x15 棋盘。双人游戏。黑方无禁手。"
        imageSrc: "/games/images/gomoku.png"
        src: "/games/gomoku.html"

      - id: "go"
        title:
          - lang: "en"
            content: "Go"
          - lang: "zh"
            content: "围棋"
        intro:
          - lang: "en"
            content: "10x19 board. Two-player game."
          - lang: "zh"
            content: "19x19 棋盘。双人游戏。"
        imageSrc: "/games/images/go.png"
        src: "/games/go.html"

      - id: "cchess"
        title:
          - lang: "en"
            content: "Chinese Chess"
          - lang: "zh"
            content: "中国象棋"
        intro:
          - lang: "en"
            content: "Two-player game. Red first."
          - lang: "zh"
            content: "双人游戏。红先黑后。"
        imageSrc: "/games/images/cchess.png"
        src: "/games/cchess.html"

      - id: "chess"
        title:
          - lang: "en"
            content: "Chess"
          - lang: "zh"
            content: "国际象棋"
        intro:
          - lang: "en"
            content: "Two-player game. White first."
          - lang: "zh"
            content: "双人游戏。白先黑后。"
        imageSrc: "/games/images/chess.png"
        src: "/games/chess.html"

  - id: "catchcat"
    title:
      - lang: "en"
        content: "Catch the Cat"
      - lang: "zh"
        content: "抓猫"
    items:
      - id: "catchcat"
        title:
          - lang: "en"
            content: "Catch the Cat"
          - lang: "zh"
            content: "抓猫原版"
        intro:
          - lang: "en"
            content: "Click on the tiles to trap the cat. Game over when it reaches the edge."
          - lang: "zh"
            content: "点击格子围住猫。猫跑到边缘则游戏结束。"
        imageSrc: "/games/images/cat-original.png"
        src: "/games/catchcat/catchcat.html"

      - id: "catchcatpoop"
        title:
          - lang: "en"
            content: "Catch the Cat: Poopsweeper"
          - lang: "zh"
            content: "抓猫扫雷版"
        intro:
          - lang: "en"
            content: "Observe the numbers to avoid cat poop that the cat won't step on."
          - lang: "zh"
            content: "观察数字，避免踩到猫屎。猫不会踩猫屎。"
        imageSrc: "/games/images/cat-poo.png"
        src: "/games/catchcat/catchcatpoo.html"

      - id: "catch2cats"
        title:
          - lang: "en"
            content: "Catch the Cat: Two Cats"
          - lang: "zh"
            content: "抓猫双猫版"
        intro:
          - lang: "en"
            content: "Open two tiles each turn and trap the two cats that won't overlap."
          - lang: "zh"
            content: "每回合点开两格，围住两只猫。猫不会重叠。"
        imageSrc: "/games/images/cat-two.png"
        src: "/games/catchcat/catch2cat.html"

  - id: "minesweeper"
    title:
      - lang: "en"
        content: "Minesweeper"
      - lang: "zh"
        content: "扫雷"
    items:
      - id: "minesweeper"
        title:
          - lang: "en"
            content: "Minesweeper"
          - lang: "zh"
            content: "扫雷原版"
        intro:
          - lang: "en"
            content: "Classic minesweeper game."
          - lang: "zh"
            content: "经典扫雷游戏。"
        imageSrc: "/games/images/mine-sweeper.png"
        src: "/games/minesweeper/minesweeper.html"

      - id: "liesweeper"
        title:
          - lang: "en"
            content: "Minesweeper: Deceptive Digits"
          - lang: "zh"
            content: "扫雷：数字会说谎"
        intro:
          - lang: "en"
            content: "Some numbers are either 1 more or 1 less than their actual value."
          - lang: "zh"
            content: "部分数字比实际值多 1 或少 1。"
        imageSrc: "/games/images/lie-sweeper.png"
        src: "/games/minesweeper/liesweeper.html"

      - id: "ghostsweeper"
        title:
          - lang: "en"
            content: "Minesweeper: Ghosts"
          - lang: "zh"
            content: "幽灵扫雷"
        intro:
          - lang: "en"
            content: "Restart after a mistake, and a ghost appears repeating previous actions."
          - lang: "zh"
            content: "失误后重开，并在场上出现重复先前操作的幽灵。"
        imageSrc: "/games/images/ghost-sweeper.png"
        src: "/games/minesweeper/ghostsweeper.html"

  - id: "tetris"
    title:
      - lang: "en"
        content: "Tetris"
      - lang: "zh"
        content: "俄罗斯方块"
    items:
      - id: "tetris"
        title:
          - lang: "en"
            content: "Tetris"
          - lang: "zh"
            content: "俄罗斯方块原版"
        intro:
          - lang: "en"
            content: "Classic Tetris game."
          - lang: "zh"
            content: "经典俄罗斯方块游戏。"
        imageSrc: "/games/images/tetris.png"
        src: "/games/tetris/tetris.html"

      - id: "tetrisreverse"
        title:
          - lang: "en"
            content: "Tetris: Reverse Play"
          - lang: "zh"
            content: "俄罗斯方块倒玩版"
        intro:
          - lang: "en"
            content: "Cut the bricks from the rising wall."
          - lang: "zh"
            content: "从缓慢上升的砖墙中切下各形状砖块。"
        imageSrc: "/games/images/tetris-reverse.png"
        src: "/games/tetris/tetrisreverse.html"

  - id: "miscellaneous"
    title:
      - lang: "en"
        content: "Miscellaneous"
      - lang: "zh"
        content: "其他"
    items:
      - id: "memory"
        title:
          - lang: "en"
            content: "Matching Card EX"
          - lang: "zh"
            content: "记忆翻牌超难版"
        intro:
          - lang: "en"
            content: "The same pattern won't appear before flipping half of the cards."
          - lang: "zh"
            content: "翻开半数的牌之前不会出现相同图案。"
        imageSrc: "/games/images/memory.png"
        src: "/games/memory.html"

      - id: "rps"
        title:
          - lang: "en"
            content: "Rock Paper Scissors"
          - lang: "zh"
            content: "石头剪刀布"
        intro:
          - lang: "en"
            content: "The computer's choice is made at the beginning of the game, so it can't cheat."
          - lang: "zh"
            content: "电脑的选择会在游戏开始时给出，因此电脑无法作弊。"
        imageSrc: "/games/images/rps.png"
        src: "/games/rps.html"

---