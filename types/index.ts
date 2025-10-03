// League types
export interface League {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  current_season?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  has_promotion: boolean;
  has_relegation: boolean;
  top_scorer?: {
    player_id: string;
    player_name: string;
    team_id: string;
    team_name: string;
    goals: number;
  };
}

// Team types
export interface Team {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  founded?: number;
  stadium?: string;
  city?: string;
  country?: string;
}

export interface TeamStanding extends Team {
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form?: string; // e.g., 'WWDLW'
  last_5?: Array<{
    match_id: string;
    opponent: string;
    is_home: boolean;
    score: string;
    result: 'W' | 'D' | 'L';
  }>;
}

// Match types
export interface Match {
  id: string;
  match_date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Postponed' | 'Cancelled';
  home_team: Team;
  away_team: Team;
  home_score?: number;
  away_score?: number;
  half_time_score?: string;
  full_time_score?: string;
  extra_time_score?: string;
  penalty_shootout_score?: string;
  competition: {
    id: string;
    name: string;
    logo_url?: string;
  };
  round?: string;
  venue?: string;
  referee?: string;
  attendance?: number;
  stats?: {
    possession?: {
      home: number;
      away: number;
    };
    shots?: {
      home: number;
      away: number;
    };
    shots_on_target?: {
      home: number;
      away: number;
    };
    corners?: {
      home: number;
      away: number;
    };
    fouls?: {
      home: number;
      away: number;
    };
    yellow_cards?: {
      home: number;
      away: number;
    };
    red_cards?: {
      home: number;
      away: number;
    };
  };
  events?: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty' | 'own_goal' | 'var_decision';
  minute: number;
  team: 'home' | 'away';
  player: {
    id: string;
    name: string;
    number?: number;
  };
  related_player?: {
    id: string;
    name: string;
    number?: number;
  };
  description?: string;
  is_own_goal?: boolean;
  is_penalty?: boolean;
  is_red_card?: boolean;
  is_second_yellow?: boolean;
  var_decision?: {
    type: 'goal_awarded' | 'goal_cancelled' | 'penalty_awarded' | 'penalty_cancelled' | 'red_card' | 'yellow_card' | 'offside' | 'no_offside' | 'no_handball' | 'handball';
    original_decision?: 'goal' | 'no_goal' | 'penalty' | 'no_penalty' | 'red_card' | 'no_red_card' | 'yellow_card' | 'no_yellow_card' | 'offside' | 'no_offside' | 'handball' | 'no_handball';
    reason?: string;
  };
}

// Player types
export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth?: string;
  age?: number;
  nationality?: string;
  country_code?: string;
  position?: string;
  preferred_foot?: 'right' | 'left' | 'both';
  height?: number; // in cm
  weight?: number; // in kg
  image_url?: string;
  team?: {
    id: string;
    name: string;
    logo_url?: string;
    jersey_number?: number;
  };
  stats?: PlayerStats;
}

export interface PlayerStats {
  appearances?: number;
  starts?: number;
  minutes_played?: number;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  clean_sheets?: number; // for goalkeepers and defenders
  saves?: number; // for goalkeepers
  goals_conceded?: number; // for goalkeepers
  pass_accuracy?: number; // percentage
  shots_total?: number;
  shots_on_target?: number;
  dribble_attempts?: number;
  dribble_success?: number;
  tackle_attempts?: number;
  tackle_success?: number;
  duels_won?: number;
  duels_lost?: number;
  fouls_committed?: number;
  fouls_drawn?: number;
  offsides?: number;
  penalties_scored?: number;
  penalties_attempted?: number;
  penalties_saved?: number; // for goalkeepers
  penalties_missed?: number;
  last_updated?: string;
}

// News types
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  author: string;
  published_at: string;
  updated_at?: string;
  tags?: string[];
  related_teams?: Array<{
    id: string;
    name: string;
    logo_url?: string;
  }>;
  related_players?: Array<{
    id: string;
    name: string;
    image_url?: string;
    team_id?: string;
    team_name?: string;
  }>;
  related_matches?: Array<{
    id: string;
    home_team: string;
    away_team: string;
    score?: string;
    competition: string;
  }>;
}

// Transfer types
export interface Transfer {
  id: string;
  player: {
    id: string;
    name: string;
    position?: string;
    age?: number;
    nationality?: string;
    image_url?: string;
  };
  from_team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  to_team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  transfer_date: string;
  transfer_type: 'permanent' | 'loan' | 'loan_end' | 'free' | 'unknown';
  fee?: {
    amount: number;
    currency: string;
    display: string;
  };
  contract_until?: string;
  market_value?: {
    amount: number;
    currency: string;
    display: string;
  };
  confirmed: boolean;
  league_id?: string;
  season_id?: string;
}

// Award types
export interface Award {
  id: string;
  name: string;
  description?: string;
  type: 'player' | 'team' | 'manager' | 'goal' | 'save' | 'match' | 'other';
  season_id: string;
  season_name: string;
  league_id: string;
  league_name: string;
  awarded_at: string;
  winner: {
    id: string;
    name: string;
    type: 'player' | 'team' | 'manager';
    image_url?: string;
    team_id?: string;
    team_name?: string;
    team_logo_url?: string;
  };
  runner_up?: {
    id: string;
    name: string;
    type: 'player' | 'team' | 'manager';
    image_url?: string;
    team_id?: string;
    team_name?: string;
    team_logo_url?: string;
  };
  third_place?: {
    id: string;
    name: string;
    type: 'player' | 'team' | 'manager';
    image_url?: string;
    team_id?: string;
    team_name?: string;
    team_logo_url?: string;
  };
  stats?: Record<string, any>;
}
