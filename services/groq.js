import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const generateCheesyLine = async (prompt) => {
  let apiKey = "";
  try {
    const customKey = await SecureStore.getItemAsync("ds_custom_groq_api_key");
    apiKey = customKey || process.env.EXPO_PUBLIC_GROQ_API_KEY || "";
  } catch (e) {
    apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || "";
  }

  // Fallback to old AsyncStorage if secure store is empty (legacy support)
  if (!apiKey) {
    try {
      const oldKey = await AsyncStorage.getItem("GROQ_API_KEY");
      if (oldKey) {
        apiKey = oldKey;
        // Migrate it to SecureStore
        await SecureStore.setItemAsync("ds_custom_groq_api_key", oldKey);
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const systemPrompt = `You are a master of cheesy, funny, and romantic pickup lines. 
Generate exactly ONE cheesy pickup line based on the user's prompt. 
Keep it extremely short, punchy, and under 20 words. 
Do NOT include hashtags, emojis, or explanations. Just the pickup line itself.`;

  const fallbackModels = [
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "qwen/qwen3.6-27b",
    "groq/compound",
  ];

  let lastErrorMsg = "";

  for (const modelName of fallbackModels) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 40,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content.trim().replace(/^"|"$/g, '');
        }
      } else {
        lastErrorMsg = await response.text();
        console.warn(`Model ${modelName} failed (${response.status}):`, lastErrorMsg);
      }
    } catch (error) {
      console.warn(`Network/Fetch error on ${modelName}:`, error?.message);
    }
  }

  if (lastErrorMsg) {
    console.error("All AI models failed. Last error:", lastErrorMsg);
  }

  throw new Error("Failed to connect to AI. Please check your API key or internet connection.");
};
