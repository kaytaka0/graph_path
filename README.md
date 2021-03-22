# 経路決定アルゴリズムの実装

## 経路決定の手法

最小ホップによる実装を1種類、最大路による実装を2種類、計3種類の手法を実装した。

- 最小ホップによる経路決定(Dijkstraのアルゴリズム)
- 最大路による経路決定
  - 固定経路: 帯域幅を一定として経路を決定する
  - 要求時経路: 通信の発生時点での帯域幅を考慮して経路を決定する


## ファイル

- [main.ts](./main.ts) 各経路決定プログラムの動作検証をおこなっている
- [dijkstra.ts](./dijkstra.ts) 各経路決定アルゴリズムの実装プログラム

## 実行
プログラムは[Typescript](https://www.typescriptlang.org/)によって書かれている。またパッケージ管理ツールとして、`npm`を使用しているため`Node`のインストールが必要。

#### 準備
```shell
git clone git@github.com:takashimakazuki/graph_path.git
cd graph_path
npm install
# node_modulesディレクトリが生成される
```

#### テストコマンドの実行
以下のコマンドでmain.tsのコンパイル+実行が行われる
```shell
npm run test
```
