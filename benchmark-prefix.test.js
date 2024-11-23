import Tree from "./radix/radix.js";

const dataset = [];
for (let i = 0; i < 100000; i++) {
    dataset.push({ id: i, text: `Sample text entry number ${i}` });
}

const radix = new Tree()

console.time("Indexing Time");
dataset.forEach((data) => {
    radix.insert(data.text, data.id)
})
console.timeEnd("Indexing Time");

console.time("Search Time");
const results = radix.getByPrefix("Sample text entry number 500");
console.timeEnd("Search Time");

console.log(`Found ${results.length} results.`);