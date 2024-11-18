import {LeafNode, Edge, Node} from "./node.js";
import Iterator from './iterator.js'

export default class Tree {
    constructor() {
        this.root = new Node();
        this.size = 0;
    }

    len() {
        return this.size;
    }

    insert(key, value) {
        const txn = new Txn(this.root, this.size);
        const {newRoot, oldValue, updated} = txn.insert(this.root, key, key, value);
        if (newRoot) this.root = newRoot;
        if (!updated) this.size++;
        return { tree: this, oldValue, updated };
    }

    delete(key) {
        const txn = new Txn(this.root, this.size);
        const [newRoot, oldLeaf] = txn.delete(this.root, key);
        if (newRoot) this.root = newRoot;
        if (oldLeaf) this.size--;
        return { tree: this, oldValue: oldLeaf?.value || null, deleted: !!oldLeaf };
    }

    deletePrefix(prefix) {
        const txn = new Txn(this.root, this.size);
        const [newRoot, numDeletions] = txn.deletePrefix(this.root, prefix);
        if (newRoot) this.root = newRoot;
        this.size -= numDeletions;
        return { tree: this, numDeletions };
    }

    get(key) {
        return this.root.get(key);
    }

    getByPrefix(prefix) {
        let iterator = new Iterator(this.root)
        iterator.seekPrefix(prefix)
        let res = []
        while (true) {
            let nextData = iterator.next()
            if (nextData.found) {
                res.push({key: nextData.key, value: nextData.value})
                continue
            }
            break
        }
        return res
    }
}

class Txn {
    constructor(root, size) {
        this.root = root;
        this.size = size;
    }

    insert(node, key, search, value) {
        // Handle key exhaustion
        if (search.length === 0) {
            let oldValue = null;
            let didUpdate = false;

            if (node.leaf) {
                oldValue = node.leaf.value;
                didUpdate = true;
            }

            node.leaf = new LeafNode(key, value);
            node.computeLinks();
            return { node, oldValue, didUpdate };
        }

        // Look for the edge
        let index, child;
        const ed = node.getEdge(search[0]);

        if (ed) {
            index = node.edges.map(e => e.label).indexOf(ed.label)
            child = ed.node
        }

        // No edge, create one
        if (!child) {
            const leaf = new LeafNode(key, value);
            let newNode = new Node(search)
            newNode.leaf = leaf
            newNode.minLeaf = leaf
            newNode.maxLeaf = leaf
            const newEdge = new Edge(search[0], newNode)
            node.addEdge(newEdge);
            node.computeLinks();
            return { node: node, oldValue: null, didUpdate: false };
        }

        // Determine longest prefix of the search key on match
        const commonPrefix = longestPrefix(search, child.prefix);
        if (commonPrefix === child.prefix.length) {
            search = search.slice(commonPrefix);
            const { node: newChild, oldValue, didUpdate } = this.insert(child, key, search, value);

            if (newChild) {
                node.edges[index].node = newChild;
                node.computeLinks();
                return { node, oldValue, didUpdate };
            }

            return { node: null, oldValue, didUpdate };
        }

        // Split the node
        const splitNode = new Node(search.slice(0, commonPrefix));
        node.replaceEdge(new Edge(search[0], splitNode));

        // Restore the existing child node
        splitNode.addEdge(new Edge(
            child.prefix[commonPrefix],
            child
        ));
        child.prefix = child.prefix.slice(commonPrefix);

        // Create a new leaf node
        const leaf = new LeafNode(key, value);

        // If the new key is a subset, add it to this node
        search = search.slice(commonPrefix);
        if (search.length === 0) {
            splitNode.leaf = leaf;
            splitNode.minLeaf = leaf;
            splitNode.maxLeaf = leaf;
            splitNode.computeLinks();
            return { node, oldValue: null, didUpdate: false };
        }

        // Create a new edge for the node
        let newNode = new Node(search);
        newNode.leaf = leaf
        newNode.minLeaf = leaf
        newNode.maxLeaf = leaf
        splitNode.addEdge(new Edge(search[0], newNode));

        splitNode.computeLinks();
        node.computeLinks();
        return { node: node, oldValue: null, didUpdate: false };
    }

    delete(node, key) {
        if (!node) return [null, null];

        if (key.length === 0) {
            if (!node.leaf) return [null, null];
            const oldLeaf = node.leaf;
            node.leaf = null;
            node.computeLinks();
            return [node, oldLeaf];
        }

        const edge = node.getEdge(key[0]);
        if (!edge) return [null, null];

        const remainingKey = key.slice(edge.node.prefix.length);
        const [newChild, oldLeaf] = this.delete(edge.node, remainingKey);
        if (!newChild || (!newChild.leaf && newChild.edges.length === 0)) {
            node.delEdge(key[0]);
        } else {
            edge.node = newChild;
        }
        node.computeLinks();
        return [node, oldLeaf];
    }

    deletePrefix(node, prefix) {
        if (!node) return [null, 0];

        if (prefix.length === 0) {
            const deletedCount = this.trackAndCount(node);
            node.leaf = null;
            node.edges = [];
            node.computeLinks();
            return [node, deletedCount];
        }

        const edge = node.getEdge(prefix[0]);
        if (!edge) return [node, 0];

        const remainingPrefix = prefix.slice(edge.node.prefix.length);
        const [newChild, deletedCount] = this.deletePrefix(edge.node, remainingPrefix);
        if (!newChild || (!newChild.leaf && newChild.edges.length === 0)) {
            node.delEdge(prefix[0]);
        } else {
            edge.node = newChild;
        }
        node.computeLinks();
        return [node, deletedCount];
    }

    trackAndCount(node) {
        if (!node) return 0;
        let count = node.leaf ? 1 : 0;
        for (const edge of node.edges) {
            count += this.trackAndCount(edge.node);
        }
        return count;
    }
}

// Utility Functions
function longestPrefix(key1, key2) {
    const maxLength = Math.min(key1.length, key2.length);
    let i = 0;
    while (i < maxLength && key1[i] === key2[i]) i++;
    return i;
}
