// ❌ No need to import fetch
const fs = require("fs");

// Load the restaurant data from the JSON file
function loadRestaurantData() {
  const data = fs.readFileSync("./data/restaurants.json", "utf8");
  return JSON.parse(data);
}
const aiRecommendation = async (req, res) => {
  try {
    const { query } = req.body;
    const restaurantData = loadRestaurantData();

    // const prompt = `You are an AI recommendation system. Based on the following user query. Return the response strictly in the following JSON format without any additional explanation or text. Only include the _id,name, address, contact, location, average rating, cuisines, and other relevant details.\nUser Query: "${query}"\nData: ${JSON.stringify(
    //   restaurantData
    // )}`;
    const prompt = `
    **You are a restaurant recommendation assistant. Follow these rules STRICTLY:**
    1. **DO NOT show internal thinking** (no <think> tags, no reasoning steps).
    2. **Respond ONLY in bullet points** with this exact format for each restaurant:
       - Name: [name]
       - Location: [city]
       - Cuisine: [type] (add "high-protein" if applicable)
       - Address: [address]
       - Contact: [phone]
       - Rating: [rating]
    3. **DO NOT add extra text** before/after the bullet points.
    4. If no restaurants match, say: "No results found."
    
    **User Query:** "${query}"
    **Data:** ${JSON.stringify(restaurantData)}
    `;

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        stream: false,
        messages: [
          {
            role: "system", // Force the model to obey instructions
            content:
              "You are a helpful AI. Respond DIRECTLY without showing internal thoughts.",
          },
          {
            role: "user",

            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log(data);

    const rawRecommendation =
      data.message?.content || "No recommendation generated.";
    const cleanRecommendation = rawRecommendation
      .replace(/<think>(.*?)<\/think>/gs, "$1") // Keeps inner content, removes tags
      .trim();
    // if (recommendation) {
    //   try {
    //     const restaurantJson = JSON.parse(recommendation);
    //     res.status(200).json({ success: true, recommendation: restaurantJson });
    //   } catch (error) {
    //     res
    //       .status(500)
    //       .json({ success: false, message: "Failed to parse AI response" });
    //   }
    // } else {
    //   res
    //     .status(404)
    //     .json({ success: false, message: "No recommendation found" });
    // }

    // const responseContent =
    //   data.message?.content || "No recommendation generated.";
    // Use regular expression to match JSON structure from the string
    // const jsonMatch = responseContent.match(/\{.*\}/s); // This will match everything inside the curly braces, including nested objects

    // if (jsonMatch && jsonMatch[0]) {
    //   try {
    //     const restaurantJson = JSON.parse(jsonMatch[0]);
    //     res.status(200).json({ success: true, recommendation: restaurantJson });
    //   } catch (error) {
    //     res
    //       .status(500)
    //       .json({ success: false, message: "Failed to parse AI response" });
    //   }
    // } else {
    //   res
    //     .status(404)
    //     .json({ success: false, message: "No recommendation found" });
    // }
    res
      .status(200)
      .json({ success: true, recommendation: cleanRecommendation });
  } catch (error) {
    console.error("AI Recommendation error", error);
    res
      .status(500)
      .json({ success: false, message: "AI recommendation failed" });
  }
};

module.exports = { aiRecommendation };
