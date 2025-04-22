/**
 * Toolhouse SDK integration service for OpenAI
 */
import { Toolhouse } from '@toolhouseai/sdk';
import OpenAI from 'openai';
import { getStoredApiKeys } from './apiKeyService';

/**
 * Process a URL with Toolhouse using OpenAI
 * @param url The URL to process
 * @returns Promise with the processing results
 */
export const processUrl = async (url: string) => {
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
    
    console.log(`Processing URL: ${url}`);
    
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
    
    // Model to use - gpt-4o-mini works well and is cost-effective
    const MODEL = 'gpt-4o-mini';
    
    // Initial message to get page contents and summarize
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      "role": "user",
      "content": `Get the contents of following documentation from ${url} and summarize them in a few bullet points.
      IMPORTANT: format everything in JSON format for a fun quiz with an array of quiz objects:
      EXAMPLE: 
      [
        {
          "title": "Quiz Topic", 
          "question": "What is the question?", 
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"], 
          "answer": "Option 2"
        },
        {
          "title": "Another Topic", 
          "question": "What is another question?", 
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"], 
          "answer": "Option 3"
        }
      ]
      IMPORTANT: Make sure to wrap all quiz objects in array brackets [] and format as valid JSON.
      `,
    }];

    // Get available tools from Toolhouse
    const tools = await toolhouse.getTools() as OpenAI.Chat.Completions.ChatCompletionTool[];
    console.log(`Available tools: ${tools.map(t => t.function.name).join(', ')}`);
    
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
      summary: chatCompleted.choices[0].message.content,
      rawResponse: chatCompleted.choices[0].message
    };
    
  } catch (error) {
    console.error(`Error processing URL:`, error);
    throw error;
  }
};

/**
 * Test API keys to verify they work
 * @param toolhouseApiKey Toolhouse API key
 * @param openaiApiKey OpenAI API key
 * @returns Promise that resolves to true if keys are valid
 */
export const testApiKeys = async (toolhouseApiKey: string, openaiApiKey: string) => {
  try {
    // Initialize Toolhouse SDK with provided API key
    const toolhouse = new Toolhouse({
      apiKey: toolhouseApiKey,
      metadata: {
        "id": "arxiv-wizard-test",
        "timezone": "0"
      }
    });
    
    // Try to get available tools from Toolhouse
    await toolhouse.getTools();
    
    // Initialize OpenAI client with provided API key
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true // Required for browser environment
    });
    
    // Try a simple OpenAI completion to verify the key
    await openai.models.retrieve('gpt-4o-mini');
    
    // If we made it here, all provided keys are valid
    return { valid: true, message: 'API keys verified successfully!' };
  } catch (error) {
    console.error('API key validation error:', error);
    let errorMessage = 'API key validation failed';
    
    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        errorMessage = 'OpenAI API key is invalid';
      } else if (error.message.includes('Toolhouse')) {
        errorMessage = 'Toolhouse API key is invalid';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { valid: false, message: errorMessage };
  }
};