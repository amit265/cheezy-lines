import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const generateCheesyLine = async (prompt, modelOverride) => {
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
    throw new Error("Missing Groq API Key");
  }

  const systemPrompt = `You are a master of cheesy, funny, and romantic pickup lines. 
Generate exactly ONE cheesy pickup line based on the user's prompt. 
Keep it extremely short, punchy, and under 20 words. 
Do NOT include hashtags, emojis, or explanations. Just the pickup line itself.`;

  // Verified active chat models mapped specifically to your API key's permissions
  const fallbackModels = modelOverride ? [modelOverride] : [
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "groq/compound"
  ];

  let lastStatus = 0;
  let lastErrorMsg = "";

  for (const modelName of fallbackModels) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
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

      lastStatus = response.status;

      if (response.ok) {
        const data = await response.json();
        let text = data?.choices?.[0]?.message?.content?.trim() || "";
        
        // Clean any reasoning blocks or wrapping quotes
        text = text.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, "").trim();
        text = text.replace(/^["']|["']$/g, "").trim();

        if (text) {
          return text;
        }
      } else {
        lastErrorMsg = await response.text();
      }
    } catch (error) {
      lastErrorMsg = error?.message;
    }
  }

  throw new Error("Our AI is feeling a bit shy right now. Tap Try Again to generate a fresh cheesy line!");
};
