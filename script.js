const INF = Number.MAX_SAFE_INTEGER;
const SPEED = 10.0;

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("calculateBtn").addEventListener("click", calculateShortestPath);
});

const graph = [
    [0, 4, 2, 0, 0, 0, 0, 0],
    [4, 0, 0, 5, 0, 0, 0, 0],
    [2, 0, 0, 8, 7, 0, 0, 0],
    [0, 5, 8, 0, 2, 6, 0, 0],
    [0, 0, 7, 2, 0, 3, 4, 0],
    [0, 0, 0, 6, 3, 0, 1, 0],
    [0, 0, 0, 0, 4, 1, 0, 7],
    [0, 0, 0, 0, 0, 0, 7, 0]
];

function calculateShortestPath() {
    let src = document.getElementById("source").value.charCodeAt(0) - 65;
    let dest = document.getElementById("destination").value.charCodeAt(0) - 65;
    
    let result = dijkstra(graph, src, dest);
    let resultDiv = document.getElementById("result");
    
    if (typeof result === "string") {
        resultDiv.innerHTML = `<p>${result}</p>`;
    } else {
        resultDiv.innerHTML = `
            <p><strong>Shortest Distance:</strong> ${result.distance} meters</p>
            <p><strong>Estimated Time:</strong> ${result.time} minutes</p>
            <p><strong>Path:</strong> ${result.path.join(" → ")}</p>
        `;
        drawGraph(result.path);
    }
}

function dijkstra(graph, src, dest) {
    let n = graph.length;
    let dist = Array(n).fill(INF);
    let visited = Array(n).fill(false);
    let parent = Array(n).fill(-1);
    
    dist[src] = 0;
    for (let count = 0; count < n - 1; count++) {
        let minDist = INF, u = -1;
        for (let i = 0; i < n; i++) {
            if (!visited[i] && dist[i] < minDist) {
                minDist = dist[i];
                u = i;
            }
        }
        if (u === -1) break;
        visited[u] = true;
        for (let v = 0; v < n; v++) {
            if (graph[u][v] !== 0 && !visited[v] && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                parent[v] = u;
            }
        }
    }
    
    if (dist[dest] === INF) {
        return "No path available";
    }
    
    let path = [];
    for (let v = dest; v !== -1; v = parent[v]) {
        path.push(String.fromCharCode(65 + v));
    }
    path.reverse();
    
    return {
        distance: dist[dest],
        time: (dist[dest] / 10.0) * 60,
        path
    };
}

function drawGraph(path) {
    d3.select("#graph").selectAll("*").remove();
    const width = 500, height = 500;
    const svg = d3.select("#graph").append("svg").attr("width", width).attr("height", height);
    
    const nodes = graph.map((_, i) => ({ id: String.fromCharCode(65 + i) }));
    let links = [];
    graph.forEach((row, i) => {
        row.forEach((weight, j) => {
            if (weight !== 0) {
                links.push({ source: String.fromCharCode(65 + i), target: String.fromCharCode(65 + j), weight });
            }
        });
    });
    
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(d => d.weight * 10))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", d => path.includes(d.source.id) && path.includes(d.target.id) ? "red" : "#aaa")
        .attr("stroke-width", 2)
        .attr("marker-end", d => path.includes(d.source.id) && path.includes(d.target.id) ? "url(#arrow)" : "");

    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "red");

    const node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 10)
        .attr("fill", d => path.includes(d.id) ? "red" : "blue");

    svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("dy", -15)
        .attr("text-anchor", "middle")
        .text(d => d.id);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        svg.selectAll("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y - 15);
    });
}
