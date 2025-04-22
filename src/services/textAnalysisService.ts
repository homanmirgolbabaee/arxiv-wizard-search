/**
 * Service for analyzing text snippets using Toolhouse AI
 */
import { Toolhouse } from '@toolhouseai/sdk';
import OpenAI from 'openai';
import { getStoredApiKeys } from './apiKeyService';

/**
 * Analyze selected text from a PDF with Toolhouse using OpenAI
 * @param selectedText The text to analyze
 * @returns Promise with the analysis results
 */
export const analyzeText = async (selectedText: string) => {
  try {
    // Get API keys from storage
    const { toolhouseApiKey, openaiApiKey } = getStoredApiKeys();
    
    // Validate that required keys are available
    if (!toolhouseApiKey) {
      throw new Error('Toolhouse API key not configured. Please set up your API keys first.');
    }
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please set up your API keys first.');
    }
    
    console.log(`Analyzing selected text (${selectedText.length} characters)`);
    
    // Initialize Toolhouse SDK with user's API key
    const toolhouse = new Toolhouse({
      apiKey: toolhouseApiKey,
      metadata: {
        "id": "arxiv-wizard",
        "timezone": "0",
      }
    });
    
    // Initialize OpenAI client with user's API key
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true // Required for browser environment
    });
    
    // Model to use
    const MODEL = 'gpt-4o-mini';
    
    // Message for analyzing the selected text
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      "role": "user",
      "content": `You are a research assistant helping break down and explain academic texts in a structured, friendly yet scientific way. Analyze the following selection from a scientific paper, and return your output in this structure:
      1. **Summary / Breakdown**: What is this section saying in simpler words?
      2. **Main Topic / Purpose**: What is the key idea or goal being discussed?
      3. **Key Terms Explained**: Define any technical terms or concepts.
      4. **Connection to Broader Research**: How does this relate to the field or problem area?
      IMPORTANT: DO NOT ADD ANY WORDING MORE THAN THE BULLET POINTS SPECEFIED.
      Text:
      ${selectedText}
      `,
    }];

    // Get available tools from Toolhouse
    const tools = await toolhouse.getTools() as OpenAI.Chat.Completions.ChatCompletionTool[];
    
    // First call - ask the model to use tools
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: MODEL,
      tools
    });

    // Run the tools requested by the model
    const openAiMessage = await toolhouse.runTools(chatCompletion) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    console.log('Tool execution completed');
    
    // Second call - include the tool results and get the final answer
    const newMessages = [...messages, ...openAiMessage];
    const chatCompleted = await openai.chat.completions.create({
      messages: newMessages,
      model: MODEL,
      tools
    });

    // Return the simplified response
    return {
      analysis: chatCompleted.choices[0].message.content,
      rawResponse: chatCompleted.choices[0].message
    };
    
  } catch (error) {
    console.error(`Error analyzing text:`, error);
    throw error;
  }
};