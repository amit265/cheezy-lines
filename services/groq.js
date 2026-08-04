import AsyncStorage from "@react-native-async-storage/async-storage";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export const generateCheesyLine = async (prompt) => {
  try {
    let apiKey = await AsyncStorage.getItem("GROQ_API_KEY");
    
    // Fallback to environment variable if no key is saved in settings
    if (!apiKey) {
      apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error("NO_API_KEY");
    }

    const systemPrompt = `You are a master of cheesy, funny, and romantic pickup lines. 
Generate exactly ONE cheesy pickup line based on the user's prompt. 
Keep it extremely short, punchy, and under 20 words. 
Do NOT include hashtags, emojis, or explanations. Just the pickup line itself.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 40,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to generate line");
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim().replace(/^"|"$/g, '');
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    if (error.message === "NO_API_KEY") {
      throw error;
    }
    console.error("Groq AI Error:", error);
    throw new Error("Failed to connect to AI. Please check your API key or internet connection.");
  }
};
