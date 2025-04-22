/**
 * Toolhouse SDK integration service
 */
import { Toolhouse } from '@toolhouseai/sdk';
import OpenAI from 'openai';
import { getStoredApiKeys } from './apiKeyService';
import { testAnthropicApiKey } from './anthropicService';

/**
 * Process a URL with Toolhouse and OpenAI
 * @param url The URL to process
 * @returns Promise with the processing results
 */
export const processUrlWithToolhouse = async (url: string) => {
  try {
    // Get API keys from storage
    const { toolhouseApiKey, openaiApiKey } = getStoredApiKeys();
    
    if (!toolhouseApiKey || !openaiApiKey) {
      throw new Error('API keys not configured. Please set up your API keys first.');
    }
    
    console.log(`Processing URL with OpenAI: ${url}`);
    
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
    
    // Initial message to get page contents and summarize
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      "role": "user",
      "content": `Get the contents of ${url} and summarize them in a few bullet points.`,
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

    // Return the complete response
    return {
      initialRequest: messages,
      toolExecution: openAiMessage,
      finalResponse: chatCompleted.choices[0].message,
      completeData: chatCompleted
    };
  } catch (error) {
    console.error('Error processing URL with Toolhouse SDK:', error);
    throw error;
  }
};

/**
 * Test API keys to verify they work
 * @param toolhouseApiKey Toolhouse API key
 * @param openaiApiKey OpenAI API key
 * @param anthropicApiKey Optional Anthropic API key
 * @returns Promise that resolves to true if keys are valid
 */
export const testApiKeys = async (toolhouseApiKey: string, openaiApiKey: string, anthropicApiKey?: string) => {
  try {
    // Initialize Toolhouse SDK with provided API key
    const toolhouse = new Toolhouse({
      apiKey: toolhouseApiKey,
      metadata: {
        "id": "arxiv-wizard-test",
        "timezone": "0"
      }
    });
    
    // Initialize OpenAI client with provided API key
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true // Required for browser environment
    });
    
    // Try to get available tools from Toolhouse
    const tools = await toolhouse.getTools();
    
    // Try a simple OpenAI completion to verify the key
    const model = await openai.models.retrieve('gpt-4o-mini');
    
    // If anthropic key is provided, test it too
    if (anthropicApiKey) {
      const anthropicResult = await testAnthropicApiKey(anthropicApiKey);
      if (!anthropicResult.valid) {
        return { valid: false, message: anthropicResult.message };
      }
    }
    
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