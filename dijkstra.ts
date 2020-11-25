export class Vertex {
  id: number;
  dist: number = Infinity;
  chk: boolean = false;
  path: Vertex = this; // 前ノード
  constructor(id: number) {
    this.id = id;
  }
}

export class Edge {
  constructor(
    nodes: Set<Vertex>,
    length: number = 1,
    band: number,
    id: string
  ) {
    this.nodes = nodes;
    this.length = length;
    this.band = band;
    this.id = id;
    this.initialBand = band;
  }
  nodes: Set<Vertex>;
  length: number = 0;
  band: number = 0; // 重み
  id: string = "";
  readonly initialBand: number = 0; // 重みの初期値, この変数は変更しない
}

// グラフ
export class Graph {
  vertexes: Vertex[];
  edges: Edge[];
  constructor(vertexes: Vertex[], edges: Edge[]) {
    this.vertexes = vertexes;
    this.edges = edges;
  }

  /**
   * @description
   * ダイクストラのアルゴリズム
   * 最小ホップ経路での実装
   *
   * @param {number} startId 送信ノード
   * @param {number} destId  受信ノード
   */
  public findShortestPath(startId: number, destId: number): Vertex[] {
    this.initializeDist(startId);

    let tmpNode: Vertex = this.vertexes[startId];
    while (true) {
      // 距離distと経路pathの更新
      this.updateDist(tmpNode);

      // 最短ノードを確定
      tmpNode = this.findTmpNode();
      tmpNode.chk = true;

      // 受信ノードのdistが確定された際に終了
      if (this.vertexes[destId].chk) break;

      if (this.vertexes.every((v) => v.chk)) {
        console.log("経路がありません");
        break;
      }
    }
    return this.vertexes;
  }

  /**
   * @description
   * Dijkstraアルゴリズムの距離パラメータを初期化
   * @private
   * @param {number} startId 送信ノードのID
   */
  private initializeDist(startId: number) {
    // 送信ノード以外の距離はすべてInfinity
    this.vertexes.forEach((v) => {
      v.dist = Infinity;
      v.chk = false;
    });

    // 送信ノードの距離dist=0
    this.vertexes[startId].dist = 0;
    this.vertexes[startId].chk = true;
  }

  /**
   * @description
   * previousVertexに隣接するノードの値を更新
   * @param {Vertex} previousVertex
   */
  private updateDist(previousVertex: Vertex) {
    // 隣接する辺
    const neighbers: Edge[] = this.edges.filter((e) =>
      e.nodes.has(previousVertex)
    );

    // 各隣接ノードについて、新しい距離を計算し、現在のdistより小さかった場合のみ値を更新する
    neighbers.forEach((edge: Edge) => {
      for (const v of Array.from(edge.nodes)) {
        if (v === previousVertex) continue; // 移動先ノードについて下の処理を行う

        const newDist = previousVertex.dist + edge.length;
        if (newDist < v.dist) {
          v.dist = newDist; // 距離distを更新
          v.path = previousVertex; // 前ノードを更新
        }
      }
    });
  }

  // 送信ノードからの距離が最短のノード
  private findTmpNode(): Vertex {
    return this.vertexes
      .filter((v) => !v.chk)
      .reduce((min, vertex) => {
        return vertex.dist < min.dist ? vertex : min;
      });
  }

  /**
   * @description
   * 最大路を用いた要求時経路
   *
   * @param {number} startId
   * @param {number} destId
   * @param {boolean} isDynamic trueの場合、要求時の空き容量から計算する
   */
  public findWidestPath(
    startId: number,
    destId: number,
    isDynamic: boolean = false
  ): [Edge[]?, number?] {
    this.vertexes.forEach((v) => {
      v.chk = false;
    });
    const sorted = this.edges.sort((edge1, edge2) => {
      if (edge1.band < edge2.band) return -1;
      else return 0;
    });
    for (
      let maxFlow: number = isDynamic
        ? sorted[sorted.length - 1].band
        : sorted[sorted.length - 1].initialBand; // 固定経路or要求時経路
      maxFlow > 0;
      maxFlow--
    ) {
      const subEdges: Edge[] = this.edges.filter(
        (edge) => (isDynamic ? edge.band : edge.initialBand) >= maxFlow
      );
      // 容量がmaxFlow以上のリンクのみの部分グラフ
      const subGraph = new Graph(this.vertexes, subEdges);
      const [hasPath, path] = subGraph.getPath(startId, destId);
      if (hasPath) {
        return [path, maxFlow]; // 経路が存在する場合、この経路が最大路
      }
    }
    return [undefined, undefined]; //経路が存在しない
  }

  /**
   * @description
   * グラフにstartIdからdestIdノードへの経路を返却
   * - 経路が存在しない場合 [false, null]
   * - 経路が存在する場合 [true, 経路Edge[]]
   *
   * @param {number} startId 開始ノードID
   * @param {number} destId 終点ノードID
   */
  public getPath(startId: number, destId: number): [boolean, Edge[]?] {
    // グラフの深さ優先探索
    const DFS = (startId: number) => {
      // 隣接リンク
      const neighbers: Edge[] = this.edges.filter((e) =>
        e.nodes.has(this.vertexes[startId])
      );
      neighbers.forEach((edge: Edge) => {
        for (const v of Array.from(edge.nodes)) {
          if (v.id === startId) continue; // 移動先ノードについて下の処理を行う
          if (v.chk) continue; // 探索済みの場合何もしない

          v.path = this.vertexes[startId]; // 前のノードを登録
          visited.push(v.id);
          v.chk = true;
          DFS(v.id);
        }
      });
    };

    const visited: number[] = [];
    visited.push(startId);
    DFS(startId); // 到達できるノードを全探索
    if (visited.indexOf(destId) >= 0) {
      return [true, this.getPathEdges(startId, destId)];
    } else {
      this.vertexes.forEach((v) => (v.chk = false));
      return [false];
    }
  }

  /**
   * @description
   * 経路の表示
   *
   * @param {number} startId
   * @param {number} endId
   */
  public printPath(startId: number, endId: number): void {
    if (this.vertexes.every((v) => v.path === v)) {
      throw new Error("経路の探索が行われていません");
    }

    let result = "end";
    let node = this.vertexes[endId];

    while (true) {
      result = `${node.id} -> ${result}`;

      if (node.id === startId) break;
      node = node.path;
    }
    console.log(result); // 経路の表示
  }

  public getPathEdges(startId: number, endId: number): Edge[] {
    let node = this.vertexes[endId];
    const edges: Edge[] = [];

    while (true) {
      try {
        // 経路上の各リンクを取得
        const edge = this.edges.find(
          (e) => e.nodes.has(node) && e.nodes.has(node.path)
        );
        if (edge === undefined)
          throw new Error(`cannnot find edge ${node.id}-${node.path.id}`);

        edges.push(edge);
      } catch (e) {
        console.error(e);
      }
      node = node.path;
      if (node.id === startId) break; // 経路上のリンクをすべて取得できたら終了
    }

    return edges;
  }
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
