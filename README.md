# Claude Agent SDK Examples

This repository contains two examples demonstrating different capabilities of the Claude Agent SDK:

1. **Alfred Agent** - A simple party planning assistant
2. **Batman Multi-Agent System** - A hierarchical multi-agent system for complex tasks

## Projects

### 🎩 Alfred Agent - Party Planner

Alfred is Wayne Manor's ultimate party planning assistant. He helps plan parties by searching the web, suggesting menus, finding catering services, and generating themed party ideas.

**Features:**
- 🔍 Web search for music recommendations and party ideas
- 🍽️ Menu suggestions for different party types (casual, formal, superhero)
- 🏢 Catering service recommendations in Gotham City
- 🎭 Superhero-themed party idea generation

### 🦇 Batman Multi-Agent System - Filming Locations

A hierarchical multi-agent system that demonstrates advanced coordination patterns. A Manager Agent delegates web research tasks to a Web Search Agent, calculates travel times, and generates interactive map visualizations.

**Features:**
- 🌍 Multi-agent task delegation and coordination
- ✈️ Cargo plane travel time calculations using haversine formula
- 🗺️ Interactive map generation with Plotly
- 🤖 Specialized agents for different tasks
- 📊 Dynamic Python script generation and execution

## Installation

```bash
npm install
```

## Setup

Set your Anthropic API key as an environment variable:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

## Running the Agents

### Alfred Agent
```bash
# Start Alfred's party planner
npm start

# Or explicitly
npm run alfred
```

### Batman Multi-Agent System
```bash
# Run the multi-agent system
npm run batman
```

**Note:** The Batman system requires Python 3.x with pip installed. The agent will automatically install required Python packages (`plotly`, `pandas`, `kaleido`) during execution.

## Project Structure

### Alfred Agent
- **`tools.ts`** - Custom MCP tools for party planning
- **`alfred-agent.ts`** - Main agent implementation

### Batman Multi-Agent System
- **`cargo-travel-tool.ts`** - Haversine distance calculation tool
- **`batman-multiagent.ts`** - Multi-agent orchestration
- **`MULTIAGENT.md`** - Detailed multi-agent documentation

## Requirements

- Node.js v20 or higher
- Anthropic API key
- Python 3.x with pip (required for Batman Multi-Agent System only)

## Learn More

- [Claude Agent SDK Overview](https://code.claude.com/docs/en/agent-sdk/overview)
- [smolagents Multi-Agent Tutorial](https://huggingface.co/docs/smolagents/main/en/examples/multiagents)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
