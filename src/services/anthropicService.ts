/**
 * Anthropic Claude integration service
 */
import Anthropic from "@anthropic-ai/sdk";
import { Toolhouse } from "@toolhouseai/sdk";
import { getStoredApiKeys } from './apiKeyService';

/**
 * Process a URL with Toolhouse and Anthropic Claude
 * @param url The URL to process
 * @returns Promise with the processing results
 */
export const processUrlWithAnthropic = async (url: string) => {
  try {
    // Get API keys from storage
    const { toolhouseApiKey, anthropicApiKey } = getStoredApiKeys();
    
    if (!toolhouseApiKey) {
      throw new Error('Toolhouse API key not configured. Please set up your API keys first.');
    }
    
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured. Please set up your API keys first.');
    }
    
    console.log(`Processing URL with Anthropic: ${url}`);
    
    // Initialize Anthropic client with user's API key
    const client = new Anthropic({
      apiKey: anthropicApiKey,
    });
    
    // Initialize Toolhouse SDK with user's API key and anthropic as provider
    const toolhouse = new Toolhouse({
      apiKey: toolhouseApiKey,
      provider: "anthropic",
      metadata: {
        "id": "arxiv-wizard",
        "timezone": "0",
      }
    });
    
    // Model to use
    const MODEL = "claude-3-5-sonnet-latest";
    
    // Initial message to get page contents and summarize
    const messages: Anthropic.Messages.MessageParam[] = [{
      "role": "user",
      "content": `Get the contents of ${url} and summarize them in a few bullet points.`,
    }];

    // Get available tools from Toolhouse
    const tools = await toolhouse.getTools() as Anthropic.Messages.Tool[];
    console.log(`Available tools: ${tools.length}`);
    
    // First call - ask the model to use tools
    const message = await client.messages.create({
      max_tokens: 1024,
      messages,
      model: MODEL,
      tools
    });

    // Run the tools requested by the model
    const anthropicMessage = await toolhouse.runTools(message) as Anthropic.Messages.MessageParam[];
    console.log('Tool execution completed');
    
    // Second call - include the tool results and get the final answer
    const newMessages = [...messages, ...anthropicMessage];
    const chatCompleted = await client.messages.create({
      max_tokens: 1024,
      messages: newMessages,
      model: MODEL,
      tools
    });

    // Return the complete response
    return {
      initialRequest: messages,
      toolExecution: anthropicMessage,
      finalResponse: chatCompleted.content,
      completeData: chatCompleted
    };
  } catch (error) {
    console.error('Error processing URL with Anthropic:', error);
    throw error;
  }
};

/**
 * Test Anthropic API key to verify it works
 * @param anthropicApiKey Anthropic API key
 * @returns Promise that resolves to true if key is valid
 */
export const testAnthropicApiKey = async (anthropicApiKey: string) => {
  try {
    // Initialize Anthropic client with provided API key
    const client = new Anthropic({
      apiKey: anthropicApiKey
    });
    
    // Try a simple test message to verify the key
    const response = await client.messages.create({
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'claude-3-5-sonnet-latest'
    });
    
    return { valid: true, message: 'Anthropic API key verified successfully!' };
  } catch (error) {
    console.error('Anthropic API key validation error:', error);
    return { valid: false, message: 'Anthropic API key is invalid' };
  }
};