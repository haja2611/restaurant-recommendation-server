const buildVectorStore = require("./restaurantEmbeddings");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

const aiRecommendation = async (req, res) => {
  try {
    const { query } = req.body;

    const vectorStore = await buildVectorStore();

    const similarDocs = await vectorStore.similaritySearch(query, 5);

    if (similarDocs.length === 0) {
      return res.json({ success: true, recommendation: "No results found." });
    }

    const restaurantText = similarDocs
      .map((doc) => doc.pageContent)
      .join("\n\n");

    const { ChatOllama } = require("@langchain/community/chat_models/ollama");
    const chat = new ChatOllama({
      model: "deepseek-r1:1.5b", // Or your desired model
      baseUrl: "http://localhost:11434",
    });

    const result = await chat.call([
      new SystemMessage(
        "You are a restaurant recommendation assistant."
      ),
      new HumanMessage(
        `Here are some restaurant matches:\n\n${restaurantText}\n\nReturn them in this format strictly for each:\n- Name: \n- Location: \n- Cuisine: \n- Address: \n- Contact: \n- Rating:`
      ),
    ]);
    const rawRecommendation = result?.text || "No recommendation generated.";
    const cleanRecommendation = rawRecommendation
      .replace(/<think>(.*?)<\/think>/gs, "$1") // Keeps inner content, removes tags
      .trim();

    return res.json({
      success: true,
      recommendation: cleanRecommendation.trim(),
    });
  } catch (err) {
    console.error("Recommendation Error", err);
    res.status(500).json({ success: false, message: "Recommendation failed." });
  }
};

module.exports = { aiRecommendation };

// // ❌ No need to import fetch
// const fs = require("fs");

// // Load the restaurant data from the JSON file
// function loadRestaurantData() {
//   const data = fs.readFileSync("./data/restaurants.json", "utf8");
//   return JSON.parse(data);
// }

// const aiRecommendation = async (req, res) => {
//   try {
//     const { query } = req.body;
//     const restaurantData = loadRestaurantData();

//     // const prompt = `You are an AI recommendation system. Based on the following user query. Return the response strictly in the following JSON format without any additional explanation or text. Only include the _id,name, address, contact, location, average rating, cuisines, and other relevant details.\nUser Query: "${query}"\nData: ${JSON.stringify(
//     //   restaurantData
//     // )}`;
//     const prompt = `
//     **You are a restaurant recommendation assistant. Follow these rules STRICTLY:**
//     1. **DO NOT show internal thinking** (no <think> tags, no reasoning steps).
//     2. **Respond ONLY in bullet points** with this exact format for each restaurant:
//        - Name: [name]
//        - Location: [city]
//        - Cuisine: [type] (add "high-protein" if applicable)
//        - Address: [address]
//        - Contact: [phone]
//        - Rating: [rating]
//     3. **DO NOT add extra text** before/after the bullet points.
//     4. If no restaurants match, say: "No results found."

//     **User Query:** "${query}"
//     **Data:** ${JSON.stringify(restaurantData)}
//     `;

//     const response = await fetch("http://localhost:11434/api/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "deepseek-r1:1.5b",
//         stream: false,
//         messages: [
//           {
//             role: "system", // Force the model to obey instructions
//             content:
//               "You are a helpful AI. Respond DIRECTLY without showing internal thoughts.",
//           },
//           {
//             role: "user",

//             content: prompt,
//           },
//         ],
//       }),
//     });

//     const data = await response.json();
//     console.log(data);

//     const rawRecommendation =
//       data.message?.content || "No recommendation generated.";
//     const cleanRecommendation = rawRecommendation
//       .replace(/<think>(.*?)<\/think>/gs, "$1") // Keeps inner content, removes tags
//       .trim();
//     res
//       .status(200)
//       .json({ success: true, recommendation: cleanRecommendation });
//   } catch (error) {
//     console.error("AI Recommendation error", error);
//     res
//       .status(500)
//       .json({ success: false, message: "AI recommendation failed" });
//   }
// };

// module.exports = { aiRecommendation };
