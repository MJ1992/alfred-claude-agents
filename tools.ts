import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

/**
 * Tool to suggest a menu based on the party occasion
 */
export const suggestMenu = tool(
  'suggestMenu',
  'Suggests a menu based on the occasion. Returns a menu description for casual, formal, superhero, or custom party types.',
  {
    occasion: z
      .string()
      .describe(
        'The type of occasion for the party. Allowed values are: "casual", "formal", "superhero", or "custom".'
      ),
  },
  async (args) => {
    const { occasion } = args;

    let menu: string;
    switch (occasion.toLowerCase()) {
      case 'casual':
        menu = 'Pizza, snacks, and drinks.';
        break;
      case 'formal':
        menu = '3-course dinner with wine and dessert.';
        break;
      case 'superhero':
        menu = 'Buffet with high-energy and healthy food.';
        break;
      case 'custom':
        menu = 'Custom menu for the butler.';
        break;
      default:
        menu = 'Custom menu for the butler.';
    }

    return {
      content: [{ type: 'text', text: menu }],
    };
  }
);

/**
 * Tool to find the highest-rated catering service in Gotham City
 */
export const cateringService = tool(
  'cateringService',
  'Returns the highest-rated catering service in Gotham City based on a search query.',
  {
    query: z.string().describe('A search term for finding catering services.'),
  },
  async (args) => {
    // Example list of catering services and their ratings
    const services = {
      'Gotham Catering Co.': 4.9,
      'Wayne Manor Catering': 4.8,
      'Gotham City Events': 4.7,
    };

    // Find the highest rated catering service
    const bestService = Object.keys(services).reduce((a, b) =>
      services[a as keyof typeof services] > services[b as keyof typeof services] ? a : b
    );

    return {
      content: [
        {
          type: 'text',
          text: `The highest-rated catering service in Gotham City is: ${bestService} (Rating: ${services[bestService as keyof typeof services]}/5.0)`,
        },
      ],
    };
  }
);

/**
 * Tool to generate superhero-themed party ideas
 */
export const superheroPartyTheme = tool(
  'superheroPartyTheme',
  'Suggests creative superhero-themed party ideas based on a category. Returns a unique party theme idea.',
  {
    category: z
      .string()
      .describe(
        'The type of superhero party (e.g., "classic heroes", "villain masquerade", "futuristic Gotham").'
      ),
  },
  async (args) => {
    const { category } = args;

    const themes: Record<string, string> = {
      'classic heroes':
        "Justice League Gala: Guests come dressed as their favorite DC heroes with themed cocktails like 'The Kryptonite Punch'.",
      'villain masquerade':
        "Gotham Rogues' Ball: A mysterious masquerade where guests dress as classic Batman villains.",
      'futuristic gotham':
        'Neo-Gotham Night: A cyberpunk-style party inspired by Batman Beyond, with neon decorations and futuristic gadgets.',
    };

    const themeIdea =
      themes[category.toLowerCase()] ||
      "Themed party idea not found. Try 'classic heroes', 'villain masquerade', or 'futuristic Gotham'.";

    return {
      content: [{ type: 'text', text: themeIdea }],
    };
  }
);

