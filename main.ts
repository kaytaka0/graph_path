import { Vertex, Edge, Graph, getRandomInt } from "./dijkstra";
// ノードのデータ
const vertexes: Vertex[] = Array(10)
  .fill(1)
  .map((v, index) => new Vertex(index));

// リンクのデータ
const edges: Edge[] = [
  new Edge(new Set([vertexes[0], vertexes[1]]), 1, 3, "0-1"),
  new Edge(new Set([vertexes[0], vertexes[3]]), 1, 3, "0-3"),
  new Edge(new Set([vertexes[1], vertexes[2]]), 1, 3, "1-2"),
  new Edge(new Set([vertexes[1], vertexes[3]]), 1, 4, "1-3"),
  new Edge(new Set([vertexes[2], vertexes[4]]), 1, 4, "2-4"),
  new Edge(new Set([vertexes[2], vertexes[5]]), 1, 3, "2-5"),
  new Edge(new Set([vertexes[3], vertexes[4]]), 1, 5, "3-4"),
  new Edge(new Set([vertexes[3], vertexes[7]]), 1, 3, "3-7"),
  new Edge(new Set([vertexes[4], vertexes[5]]), 1, 5, "4-5"),
  new Edge(new Set([vertexes[4], vertexes[7]]), 1, 4, "4-7"),
  new Edge(new Set([vertexes[5], vertexes[6]]), 1, 3, "5-6"),
  new Edge(new Set([vertexes[5], vertexes[8]]), 1, 4, "5-8"),
  new Edge(new Set([vertexes[6], vertexes[8]]), 1, 3, "6-8"),
  new Edge(new Set([vertexes[7], vertexes[8]]), 1, 4, "7-8"),
  new Edge(new Set([vertexes[7], vertexes[9]]), 1, 3, "7-9"),
  new Edge(new Set([vertexes[8], vertexes[9]]), 1, 3, "8-9"),
];

function getFailRate(connectionTime: number) {
  const CONNECTION_TIME = connectionTime; // コネクション時間
  const CONNETCION_COUNT = 10000;
  const connection: (Edge[] | null)[] = Array(CONNETCION_COUNT); // 確立した通信の配列
  let connectionFailedCount = 0; // 呼損回数
  let notFound = 0;
  // 10回の通信を発生させる
  for (let count = 0; count < connection.length; count++) {
    const g = new Graph(vertexes, edges);

    // ランダムに開始、終了地点を選択
    let start: number = 0;
    let end: number = 0;
    let isConnected = true; // 通信が確立したか
    while (start === end) {
      start = getRandomInt(0, 10);
      end = getRandomInt(0, 10);
    }

    // 経路の探索
    // g.findShortestPath(start, end);
    // const path = g.getPathEdges(start, end);
    const [path, flow] = g.findWidestPath(start, end, true);
    if (path === undefined) {
      isConnected = false;
      notFound++;
    }

    path?.forEach((edge) => {
      if (edge.band <= 0) {
        // 空き容量がないため通信が確立しない
        isConnected = false;
      }
    });

    if (isConnected) {
      path?.forEach((edge) => {
        edge.band--; // 通信が確立したのでリンクの空き容量を1Mbps減らす
      });
      connection[count] = path as Edge[];
    } else {
      connectionFailedCount++;
      connection[count] = null;
    }

    // 終了した通信がある場合、リンクの容量を開放する
    if (
      count >= CONNECTION_TIME &&
      connection[count - CONNECTION_TIME] !== null
    ) {
      connection[count - CONNECTION_TIME]?.forEach((edge) => {
        edge.band++;
      });
    }
  }

  console.log(
    `${CONNECTION_TIME}, ${
      (connectionFailedCount / CONNETCION_COUNT) * 100
    }, notfound ${notFound}, failed ${connectionFailedCount}`
  );
}

for (let n = 1; n < 20; n++) {
  getFailRate(n);
}
