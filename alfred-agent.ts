import { query, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { suggestMenu, cateringService, superheroPartyTheme } from './tools';

/**
 * Alfred's Party Planner Agent
 * 
 * This agent helps prepare for parties at Wayne Manor by:
 * - Searching the web for music recommendations and party ideas
 * - Suggesting menus based on party type
 * - Finding catering services in Gotham City
 * - Generating superhero-themed party ideas
 */
async function runAlfredAgent() {
  // Create an SDK MCP server with Alfred's custom tools
  const alfredMcpServer = createSdkMcpServer({
    name: 'alfred-party-tools',
    version: '1.0.0',
    tools: [suggestMenu, cateringService, superheroPartyTheme],
  });

  console.log('\n🎩 Alfred the Butler\n');
  
  const userQuery =
    "Give me the best playlist for a party at Wayne's mansion. The party idea is a 'villain masquerade' theme";

  console.log('Query:', userQuery);
  console.log('─'.repeat(80) + '\n');

  try {
    // Create the query with all necessary configurations
    const agentQuery = query({
      prompt: userQuery,
      options: {
        // Provide an AbortController to avoid Bun compatibility issues
        abortController: new AbortController(),
        // Use Claude Code system prompt for best agent behavior
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
        },
        // Configure MCP servers
        mcpServers: {
          'alfred-party-tools': alfredMcpServer,
        },
        // Allow built-in tools for web search and fetching
        allowedTools: [
          'WebSearch',
          'WebFetch',
          'Read',
          'Write',
          'Bash',
          // MCP tools will be automatically included
        ],
        maxTurns: 10,
        // Include partial messages to see the agent's reasoning
        includePartialMessages: true,
        // Set permission mode to auto-accept edits for demo
        permissionMode: 'bypassPermissions',
      },
    });

    // Stream the agent's responses
    for await (const message of agentQuery) {
      if (message.type === 'system' && message.subtype === 'init') {
        console.log('✓ Agent initialized');
        console.log(`  Model: ${message.model}`);
        console.log(`  Tools: ${message.tools.length} available\n`);
      } else if (message.type === 'assistant') {
        console.log('\n💬 Assistant:');
        
        for (const content of message.message.content) {
          if (content.type === 'text') {
            console.log(content.text);
          } else if (content.type === 'tool_use') {
            console.log(`\n🔧 Using: ${content.name}`);
            console.log(`  Input: ${JSON.stringify(content.input, null, 2)}`);
          }
        }
        console.log('\n' + '─'.repeat(80));
      } else if (message.type === 'user') {
        const toolResults = message.message.content.filter(
          (c: any) => c.type === 'tool_result'
        );
        
        if (toolResults.length > 0) {
          console.log('\n✓ Tool Results:');
          for (const result of toolResults) {
            if (result.type === 'tool_result') {
              const contentStr =
                typeof result.content === 'string'
                  ? result.content
                  : JSON.stringify(result.content, null, 2);
              console.log(contentStr);
            }
          }
          console.log('─'.repeat(80));
        }
      } else if (message.type === 'result') {
        console.log('\n' + '═'.repeat(80));
        console.log('✅ FINAL RESULT');
        console.log('═'.repeat(80) + '\n');
        
        if (message.subtype === 'success') {
          console.log(message.result + '\n');
          console.log('📊 Stats:');
          console.log(`  Duration: ${(message.duration_ms / 1000).toFixed(2)}s`);
          console.log(`  Turns: ${message.num_turns}`);
          console.log(`  Cost: $${message.total_cost_usd.toFixed(4)}`);
          console.log(`  Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out`);
        } else {
          console.log(`\n❌ Error: ${message.subtype}\n`);
          console.log(`Duration: ${(message.duration_ms / 1000).toFixed(2)}s`);
          console.log(`Turns: ${message.num_turns}`);
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

// Run the agent
runAlfredAgent().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

