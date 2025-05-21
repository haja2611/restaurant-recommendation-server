const fs = require("fs");
const path = require("path");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { Document } = require("langchain/document");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const rawData = fs.readFileSync("./data/restaurants.json", "utf8");
const restaurants = JSON.parse(rawData);

const docs = restaurants.map((rest) => {
  const content = `
    Name: ${rest.name}
    Cuisine: ${rest.cuisines.join(", ")}
    Location: ${rest.location}
    Address: ${rest.address}
    Contact: ${rest.contact}
    Rating: ${rest.average_rating}
  `;
  return new Document({ pageContent: content, metadata: { ...rest } });
});
console.log(require("@langchain/community/embeddings/ollama"));

async function buildVectorStore() {
  //   const {
  //     OllamaEmbeddings,
  //   } = require("@langchain/community/embeddings/ollama");

  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OllamaEmbeddings({
      model: "mxbai-embed-large", // or another Ollama embedding model
      baseUrl: "http://localhost:11434",
    })
  );

  return vectorStore;
}

module.exports = buildVectorStore;
