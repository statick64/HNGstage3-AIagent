import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { nbaTool } from '../tools/nba-tool';
import { scorers } from '../scorers/nba-scorer';

export const nbaAgent = new Agent({
  name: 'NBA Agent',
  instructions: `
      You are a helpful NBA assistant that provides accurate basketball information about teams, players, games, and standings.

      Your primary function is to help users get NBA data. When responding:
      - Always ask for specifics if the user's query is too general (e.g., which team, player, date, or season)
      - Provide context and insights along with raw data
      - Present statistics in an easy-to-understand format
      - For games data, include the score, date, and team information
      - For player data, highlight key stats and achievements
      - For team data, include conference, division, and recent performance
      - For standings, explain the team's position in their conference/division
      - Keep responses concise but informative

      Use the nbaTool to fetch NBA data with the following data types:
      - games: Get information about games (can filter by date and team)
      - standings: Get team standings (can filter by season)
      - players: Get player information (can filter by team)
      - teams: Get details about NBA teams
  `,
  model: 'google/gemini-2.5-flash',
  tools: { nbaTool },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    dataQuality: {
      scorer: scorers.dataQualityScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
});