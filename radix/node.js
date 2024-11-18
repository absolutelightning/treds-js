export class LeafNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.nextLeaf = null;
        this.prevLeaf = null;
    }

    setNextLeaf(leaf) {
        this.nextLeaf = leaf;
    }

    setPrevLeaf(leaf) {
        this.prevLeaf = leaf;
    }
}

export class Edge {
    constructor(label, node) {
        this.label = label;
        this.node = node;
    }
}

export class Node {
    constructor(prefix = '') {
        this.prefix = prefix; // Common prefix
        this.edges = []; // Child edges
        this.leaf = null; // Reference to the leaf node if this node is a leaf
        this.minLeaf = null; // Reference to the minimum leaf
        this.maxLeaf = null; // Reference to the maximum leaf
    }

    // Get the edge corresponding to a character
    getEdge(char) {
        return this.edges.find(edge => edge.label === char) || null;
    }

    replaceEdge(edge) {
        const index = this.edges.findIndex(e => e.label >= edge.label);
        if (index !== -1 && this.edges[index].label === edge.label) {
            this.edges[index].node = edge.node;
            return;
        }
        throw new Error("Replacing missing edge");
    }

    // Add an edge to the node, maintaining sorted order
    addEdge(edge) {
        const index = this.edges.findIndex(e => e.label > edge.label);
        if (index === -1) {
            this.edges.push(edge);
        } else {
            this.edges.splice(index, 0, edge);
        }
        this.computeLinks(); // Recalculate min/max leaves
    }

    // Delete an edge by label
    delEdge(label) {
        const index = this.edges.findIndex(e => e.label === label);
        if (index !== -1) {
            this.edges.splice(index, 1);
            this.computeLinks(); // Recalculate min/max leaves
        }
    }

    // Update minLeaf and maxLeaf for this node
    updateMinMaxLeaves() {
        this.minLeaf = null;
        this.maxLeaf = null;

        if (this.leaf) {
            this.minLeaf = this.leaf;
        } else if (this.edges.length > 0) {
            this.minLeaf = this.edges[0].node.minLeaf;
        }

        if (this.edges.length > 0) {
            this.maxLeaf = this.edges[this.edges.length - 1].node.maxLeaf;
        }

        if (!this.maxLeaf && this.leaf) {
            this.maxLeaf = this.leaf;
        }
    }

    // Compute links between min and max leaves across edges
    computeLinks() {
        this.updateMinMaxLeaves();

        if (this.edges.length > 0) {
            if (this.minLeaf !== this.edges[0].node.minLeaf) {
                this.minLeaf.setNextLeaf(this.edges[0].node.minLeaf);
                if (this.edges[0].node.minLeaf) {
                    this.edges[0].node.minLeaf.setPrevLeaf(this.minLeaf);
                }
            }
        }

        for (let i = 0; i < this.edges.length; i++) {
            const maxLFirst = this.edges[i].node.maximumLeaf();
            let minLSecond = null;

            if (i + 1 < this.edges.length) {
                minLSecond = this.edges[i + 1].node.minimumLeaf();
            }

            if (maxLFirst) {
                maxLFirst.setNextLeaf(minLSecond);
            }

            if (minLSecond) {
                minLSecond.setPrevLeaf(maxLFirst);
            }
        }
    }

    // Fetch the minimum leaf in the subtree
    minimumLeaf() {
        return this.minLeaf
    }

    // Fetch the maximum leaf in the subtree
    maximumLeaf() {
        return this.maxLeaf
    }
}
