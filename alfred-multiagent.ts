import { query, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import { calculateCargoTravelTime } from './cargo-travel-tool';

/**
 * Alfred Multi-Agent System - Filming Locations
 * 
 * This implements a hierarchical multi-agent system where:
 * - A Manager Agent coordinates the overall task
 * - A Web Search Agent specializes in finding information online
 * - The Manager delegates research tasks to the Web Agent
 * - The Manager aggregates results and generates visualizations
 */

// ============================================================================
// Message Handlers - Extracted for readability
// ============================================================================

function handleSystemInit(message: Extract<SDKMessage, { type: 'system' }>) {
  if (message.subtype !== 'init') return;
  console.log(`✓ Initialized (${message.model})\n`);
}

function handleAssistantMessage(
  message: Extract<SDKMessage, { type: 'assistant' }>,
  currentAgent: { value: string }
) {
  const agentName = message.parent_tool_use_id ? 'Web Search Agent' : 'Manager Agent';
  
  if (agentName !== currentAgent.value) {
    currentAgent.value = agentName;
    console.log(`\n🤖 ${agentName}`);
  }

  for (const content of message.message.content) {
    if (content.type === 'tool_use' && content.name === 'Task') {
      const input = content.input as any;
      console.log(`   → Delegating: ${input.description}`);
    }
  }
}

function handleResultMessage(message: Extract<SDKMessage, { type: 'result' }>) {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 FINAL RESULT');
  console.log('═'.repeat(80) + '\n');
  
  if (message.subtype === 'success') {
    console.log(message.result + '\n');
    console.log('📊 Statistics:');
    console.log(`  Duration: ${(message.duration_ms / 1000).toFixed(2)}s`);
    console.log(`  Turns: ${message.num_turns}`);
    console.log(`  Cost: $${message.total_cost_usd.toFixed(4)}`);
    console.log(`  Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out`);
    
    if (message.usage.cache_read_input_tokens) {
      console.log(`  Cache: ${message.usage.cache_read_input_tokens} tokens read`);
    }
  } else {
    console.log(`❌ Error: ${message.subtype}`);
    console.log(`Duration: ${(message.duration_ms / 1000).toFixed(2)}s`);
  }
}

// ============================================================================
// Main Multi-Agent Runner
// ============================================================================
async function runAlfredMultiAgent() {
  // Create an SDK MCP server with the cargo travel time tool
  const cargoToolServer = createSdkMcpServer({
    name: 'cargo-tools',
    version: '1.0.0',
    tools: [calculateCargoTravelTime],
  });

  console.log('🦇 Alfred Multi-Agent System - Filming Locations\n');
  
  const task = `Find all Batman filming locations in the world, calculate the time to transfer via cargo plane to here (we're in Gotham, 40.7128° N, 74.0060° W).
Also give me some supercar factories with the same cargo plane transfer time. You need at least 6 points in total.
Represent this as spatial map of the world, with the locations represented as scatter points with a color that depends on the travel time, and save it to saved_map.png!

Here's an example of how to plot and return a map using Python:
\`\`\`python
import plotly.express as px
import pandas as pd

# Create your dataframe with columns: name, latitude, longitude, travel_time
df = pd.DataFrame({
    'name': ['Location 1', 'Location 2'],
    'latitude': [51.5074, 40.7128],
    'longitude': [-0.1278, -74.0060],
    'travel_time': [8.5, 1.0]
})

fig = px.scatter_map(df, lat="latitude", lon="longitude", text="name", color="travel_time", 
                      size_max=15, zoom=1,
                      color_continuous_scale=px.colors.sequential.Magma)
fig.write_image("saved_map.png")
\`\`\`

Important instructions:
1. Use the web_search_agent to find Batman filming locations and supercar factories
2. For each location, get coordinates (latitude, longitude)
3. Use calculate_cargo_travel_time tool to calculate travel time from Gotham
4. First install required Python packages: pip install plotly pandas kaleido -q
5. Write a Python script that creates the map visualization
6. Execute the script using Bash to generate saved_map.png
7. Never try to process strings using code: when you have a string to read, just print it and you'll see it.`;

  try {
    // Create the multi-agent query
    const agentQuery = query({
      prompt: task,
      options: {
        abortController: new AbortController(),
        
        // Define the Web Search Agent as a subagent
        agents: {
          web_search_agent: {
            description: 'Browses the web to find information. Use this agent for web searches and visiting webpages to gather data about Batman filming locations and supercar factories.',
            tools: ['WebSearch', 'WebFetch'],
            prompt: `You are an expert web researcher. Your job is to:
- Perform thorough web searches to find accurate information
- Visit multiple sources to verify facts
- Extract specific data like locations, coordinates, and relevant details
- Be comprehensive and don't hesitate to search multiple queries
- Visit source URLs to confirm information
- Return detailed, structured information to the manager agent`,
            model: 'sonnet', // Use Sonnet for the web agent
          },
        },

        // System prompt for the Manager Agent
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: `

You are an expert analyst and coordinator managing a team of specialized agents.

Your responsibilities:
1. DELEGATE web research tasks to the web_search_agent using the Task tool
2. Use calculate_cargo_travel_time to compute flight times
3. Aggregate and analyze data from multiple sources
4. Write Python scripts to generate visualizations
5. Execute scripts using the Bash tool

When delegating to web_search_agent:
- Give clear, specific search tasks
- Ask for structured data with coordinates
- Request verification from multiple sources

For the map visualization:
- Install Python packages first: pip install plotly pandas kaleido -q
- Write a complete Python script with all the data
- Use plotly.express.scatter_map for geographic visualization
- Color code by travel_time
- Save to saved_map.png`,
        },

        // Configure MCP servers
        mcpServers: {
          'cargo-tools': cargoToolServer,
        },

        // Manager agent gets access to these tools
        allowedTools: [
          'Task',              // For delegating to subagents
          'WebSearch',         // Direct web access if needed
          'WebFetch',          // Direct web access if needed
          'Read',             // For reading files
          'Write',            // For writing Python scripts
          'Bash',             // For executing Python scripts
          'Glob',             // For finding files
          'Grep',             // For searching content
        ],

        maxTurns: 25,
        includePartialMessages: false,
        permissionMode: 'bypassPermissions',
      },
    });

    // Stream and handle agent responses
    const currentAgent = { value: 'Manager' };
    
    for await (const message of agentQuery) {
      if (message.type === 'system') {
        handleSystemInit(message);
      } else if (message.type === 'assistant') {
        handleAssistantMessage(message, currentAgent);
      } else if (message.type === 'result') {
        handleResultMessage(message);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

// Run the multi-agent system
runAlfredMultiAgent().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

