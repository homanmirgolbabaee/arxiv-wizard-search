/**
 * Toolhouse SDK integration service for both OpenAI and Anthropic
 */
import { Toolhouse } from '@toolhouseai/sdk';
import OpenAI from 'openai';
import Anthropic from "@anthropic-ai/sdk";
import { getStoredApiKeys } from './apiKeyService';

/**
 * Process a URL with Toolhouse using either OpenAI or Anthropic
 * @param url The URL to process
 * @param provider AI provider to use ('openai' or 'anthropic')
 * @returns Promise with the processing results
 */
export const processUrl = async (url: string, provider: 'openai' | 'anthropic' = 'openai') => {
  try {
    // Get API keys from storage
    const { toolhouseApiKey, openaiApiKey, anthropicApiKey } = getStoredApiKeys();
    
    // Validate that required keys are available
    if (!toolhouseApiKey) {
      throw new Error('Toolhouse API key not configured. Please set up your API keys first.');
    }
    
    if (provider === 'openai' && !openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please set up your API keys first.');
    }
    
    if (provider === 'anthropic' && !anthropicApiKey) {
      throw new Error('Anthropic API key not configured. Please set up your API keys first.');
    }
    
    console.log(`Processing URL with ${provider}: ${url}`);
    
    // Process based on selected provider
    if (provider === 'anthropic') {
      return await processWithAnthropic(url, toolhouseApiKey, anthropicApiKey);
    } else {
      return await processWithOpenAI(url, toolhouseApiKey, openaiApiKey);
    }
  } catch (error) {
    console.error(`Error processing URL with ${provider}:`, error);
    throw error;
  }
};

/**
 * Process URL with OpenAI and Toolhouse
 */
const processWithOpenAI = async (url: string, toolhouseApiKey: string, openaiApiKey: string) => {
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
};

/**
 * Process URL with Anthropic Claude and Toolhouse
 */
const processWithAnthropic = async (url: string, toolhouseApiKey: string, anthropicApiKey: string) => {
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
      try {
        // Initialize Anthropic client with provided API key
        const client = new Anthropic({
          apiKey: anthropicApiKey
        });
        
        // Try a simple test message to verify the key
        await client.messages.create({
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'claude-3-5-sonnet-latest'
        });
      } catch (anthropicError) {
        console.error('Anthropic API key validation error:', anthropicError);
        return { valid: false, message: 'Anthropic API key is invalid' };
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