export type gameData = {
  gameID: string;
  date: Date;
  status: string;
  tvStation: string;
  stadium: string;
  homeTeam: string;
  homeSpread: number;
  homeScore: number;
  awayTeam: string;
  awaySpread: number;
  awayScore: number;
};

export type gameType = {
  htmlClasses: any[];
  linkClasses: any[];
  dateConverter: any[];
  stringTranslation: null;
  _serviceIds: {
    dateConverter: string;
  };
  _entityStorages: any[];
  boxscoreAvailable: boolean;
  date: number;
  drawMoneyLine: null;
  eventStatus: string;
  id: number;
  nid: null;
  gameNid: number;
  gameAlias: string;
  previewNid: null;
  previewAlias: null;
  overPrice: number;
  overVotes: number;
  recapAvailable: boolean;
  segments: {
    [key: string]: {
      htmlClasses: any[];
      linkClasses: any[];
      dateConverter: any[];
      stringTranslation: null;
      _serviceIds: {
        dateConverter: string;
      };
      _entityStorages: any[];
      awayPoints: number;
      homePoints: number;
      id: string;
    };
  };
  stadium: {
    htmlClasses: any[];
    linkClasses: any[];
    dateConverter: any[];
    stringTranslation: null;
    _serviceIds: {
      dateConverter: string;
    };
    _entityStorages: any[];
    roof: string;
    stadium: string;
    stadiumRotation: number;
    surface: string;
  };
  status: string;
  statusBottom: null;
  statusTop: null;
  teams: {
    home: {
      htmlClasses: any[];
      linkClasses: any[];
      dateConverter: any[];
      stringTranslation: null;
      _serviceIds: {
        dateConverter: string;
      };
      _entityStorages: any[];
      atsRecord: null;
      city: string;
      cards: {
        red: number;
        yellow: number;
      };
      colors: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      id: number;
      moneyLine: number;
      names: {
        abbreviation: string;
        display_name: string;
        name: string;
        nick_name: string;
        short_name: string;
      };
      nid: number;
      pitcher: null;
      predictedScore: null;
      rank: null;
      record: string;
      rotation: number;
      score: number;
      spread: number;
      spreadPrice: number;
      spreadFormatted: null;
      spreadPriceFormatted: null;
      streak: null;
      votes: number;
    };
    away: {
      htmlClasses: any[];
      linkClasses: any[];
      dateConverter: any[];
      stringTranslation: null;
      _serviceIds: {
        dateConverter: string;
      };
      _entityStorages: any[];
      atsRecord: null;
      city: string;
      cards: {
        red: number;
        yellow: number;
      };
      colors: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      id: number;
      moneyLine: number;
      names: {
        abbreviation: string;
        display_name: string;
        name: string;
        nick_name: string;
        short_name: string;
      };
      nid: number;
      pitcher: null;
      predictedScore: null;
      rank: null;
      record: string;
      rotation: number;
      score: number;
      spread: number;
      spreadPrice: number;
      spreadFormatted: null;
      spreadPriceFormatted: null;
      streak: null;
      votes: number;
    };
  };
  total: number;
  tvStation: string;
  tvStationName: string;
  underPrice: number;
  underVotes: number;
  week: string;
};

