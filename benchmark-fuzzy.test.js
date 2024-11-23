import Tree from "./radix/radix.js";

const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    text: `Sample entry number ${i}`,
}));


const radix = new Tree()

console.time("Indexing Time");
largeDataset.forEach((data) => {
    radix.insert(data.text, data.id)
})
console.timeEnd("Indexing Time");

// Perform searches and measure search time
const queries = ["Sample entry number 123", "Sample entry number 5000"];
queries.forEach((query) => {
    console.time(`Search time for "${query}"`);
    const results = radix.getByFuzzy(query, 2, 'DIST');
    console.timeEnd(`Search time for "${query}"`);
    console.log(`Results for "${query}":`, results.length); // Display first 10 results
    console.log(results);
});

console.time("Search Time");
let res = radix.getByFuzzy("Sample entry number", 3, 'LEX', 10000)
console.timeEnd("Search Time");

console.log(res)
