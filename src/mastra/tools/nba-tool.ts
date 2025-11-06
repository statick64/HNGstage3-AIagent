import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface Game {
  GameID: number;
  Season: number;
  SeasonType: number;
  Status: string;
  Day: string;
  DateTime: string;
  AwayTeam: string;
  HomeTeam: string;
  AwayTeamID: number;
  HomeTeamID: number;
  AwayTeamScore: number;
  HomeTeamScore: number;
}

interface Standing {
  SeasonType: number;
  Season: number;
  TeamID: number;
  Key: string;
  City: string;
  Name: string;
  Conference: string;
  Division: string;
  Wins: number;
  Losses: number;
  Percentage: number;
  ConferenceWins: number;
  ConferenceLosses: number;
  DivisionWins: number;
  DivisionLosses: number;
}

interface Player {
  PlayerID: number;
  Status: string;
  TeamID: number;
  Team: string;
  Jersey: number;
  PositionCategory: string;
  Position: string;
  FirstName: string;
  LastName: string;
  Height: number;
  Weight: number;
  BirthDate: string;
}

interface Team {
  TeamID: number;
  Key: string;
  City: string;
  Name: string;
  Conference: string;
  Division: string;
  PrimaryColor: string;
  SecondaryColor: string;
  TertiaryColor: string;
  WikipediaLogoUrl: string;
}

interface Schedule {
  Games: Game[];
}

interface TeamStandings {
  Standings: Standing[];
}

interface PlayerList {
  Players: Player[];
}

interface TeamList {
  Teams: Team[];
}

export const nbaTool = createTool({
  id: 'get-nba',
  description: 'Get NBA data for teams, players, games, and standings',
  inputSchema: z.object({
    dataType: z.enum(['games', 'standings', 'players', 'teams']).describe('Type of NBA data to retrieve'),
    date: z.string().optional().describe('Date in YYYY-MMM-DD format (for games data)'),
    team: z.string().optional().describe('Team abbreviation (e.g., LAL for Los Angeles Lakers)'),
    season: z.string().optional().describe('Season year (e.g., 2023 for 2023-2024 season)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any(),
  }),
  execute: async ({ context }) => {
    try {
      switch (context.dataType) {
        case 'games':
          return await getNbaGames(context.date, context.team);
        case 'standings':
          return await getNbaStandings(context.season);
        case 'players':
          return await getNbaPlayers(context.team);
        case 'teams':
          return await getNbaTeams();
        default:
          throw new Error(`Invalid data type: ${context.dataType}`);
      }
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error.message}`,
        data: null,
      };
    }
  },
});

// Get API key from environment variable
const getApiKey = (): string => {
  const apiKey = process.env.SPORTSDATA_API_KEY;
  if (!apiKey) {
    throw new Error('SPORTSDATA_API_KEY environment variable is not set');
  }
  return apiKey;
};

const getNbaGames = async (date?: string, team?: string) => {
  // Default to today's date if none provided
  const gameDate = date || new Date().toISOString().split('T')[0];
  
  // Use SportsData.io API
  const apiUrl = `https://api.sportsdata.io/v3/nba/scores/json/GamesByDate/${gameDate}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': getApiKey() }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const games = await response.json() as Game[];
    
    // Filter by team if provided
    const filteredGames = team 
      ? games.filter(g => g.AwayTeam === team || g.HomeTeam === team)
      : games;
    
    return {
      success: true,
      message: `NBA games data for ${gameDate}${team ? ` involving ${team}` : ''}`,
      data: filteredGames
    };
  } catch (error) {
    throw new Error(`Failed to fetch NBA games: ${error.message}`);
  }
};

const getNbaStandings = async (season?: string) => {
  // Default to current season if none provided
  const currentYear = new Date().getFullYear();
  const seasonYear = season || currentYear.toString();
  
  // Use SportsData.io API
  const apiUrl = `https://api.sportsdata.io/v3/nba/scores/json/Standings/${seasonYear}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': getApiKey() }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const standings = await response.json() as Standing[];
    
    return {
      success: true,
      message: `NBA standings for ${seasonYear} season`,
      data: standings
    };
  } catch (error) {
    throw new Error(`Failed to fetch NBA standings: ${error.message}`);
  }
};

const getNbaPlayers = async (team?: string) => {
  // Use SportsData.io API
  const apiUrl = team
    ? `https://api.sportsdata.io/v3/nba/scores/json/Players/${team}`
    : 'https://api.sportsdata.io/v3/nba/scores/json/Players';
  
  try {
    const response = await fetch(apiUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': getApiKey() }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const players = await response.json() as Player[];
    
    return {
      success: true,
      message: team ? `NBA players for ${team}` : 'All NBA players',
      data: players
    };
  } catch (error) {
    throw new Error(`Failed to fetch NBA players: ${error.message}`);
  }
};

const getNbaTeams = async () => {
  // Use SportsData.io API
  const apiUrl = 'https://api.sportsdata.io/v3/nba/scores/json/teams';
  
  try {
    const response = await fetch(apiUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': getApiKey() }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const teams = await response.json() as Team[];
    
    return {
      success: true,
      message: 'NBA teams',
      data: teams
    };
  } catch (error) {
    throw new Error(`Failed to fetch NBA teams: ${error.message}`);
  }
};