export default class Edges {
    constructor() {
        this.edges = [];
    }

    // Add an edge
    add(edge) {
        this.edges.push(edge);
    }

    // Get the number of edges
    len() {
        return this.edges.length;
    }

    // Compare two edges to determine the sort order
    less(i, j) {
        return this.edges[i].label < this.edges[j].label;
    }

    // Swap two edges in the array
    swap(i, j) {
        [this.edges[i], this.edges[j]] = [this.edges[j], this.edges[i]];
    }

    // Sort the edges array
    sort() {
        this.edges.sort((a, b) => a.label.localeCompare(b.label));
    }
}