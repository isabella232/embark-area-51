import {combineReducers} from 'redux';
import {REQUEST, SUCCESS, FAILURE, CONTRACT_COMPILE, FILES, LOGOUT, AUTHENTICATE,
        FETCH_CREDENTIALS, UPDATE_BASE_ETHER} from "../actions";

const BN_FACTOR = 10000;
const VOID_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEFAULT_HOST = 'localhost:8000';
const MAX_ELEMENTS = 200;

const entitiesDefaultState = {
  accounts: [],
  blocks: [],
  transactions: [],
  processes: [],
  processLogs: [],
  contracts: [],
  contractProfiles: [],
  contractFunctions: [],
  contractDeploys: [],
  contractCompiles: [],
  contractLogs: [],
  commands: [],
  messages: [],
  messageChannels: [],
  versions: [],
  plugins: [],
  ensRecords: [],
  files: [],
  gasOracleStats: [],
  currentFiles: []
};

const sorter = {
  blocks: function(a, b) {
    return b.number - a.number;
  },
  transactions: function(a, b) {
    return ((BN_FACTOR * b.blockNumber) + b.transactionIndex) - ((BN_FACTOR * a.blockNumber) + a.transactionIndex);
  },
  processLogs: function(a, b) {
    return b.id - a.id;
  },
  contractLogs: function(a, b) {
    return a.timestamp - b.timestamp;
  },
  messages: function(a, b) {
    return a.time - b.time;
  },
  commands: function(a, b) {
    return a.timestamp - b.timestamp;
  },
  files: function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  }
};

const filtrer = {
  processes: function(process, index, self) {
    return index === self.findIndex((t) => t.name === process.name);
  },
  processLogs: function(processLog, index, self) {
    return index === self.findIndex((p) => p.id === processLog.id) && index <= MAX_ELEMENTS
  },
  contracts: function(contract, index, self) {
    return index === self.findIndex((t) => t.className === contract.className);
  },
  accounts: function(account, index, self) {
    return index === self.findIndex((t) => t.address === account.address);
  },
  blocks: function(block, index, self) {
    if (index > MAX_ELEMENTS) {
      return false;
    }

    return index === self.findIndex((t) => t.number === block.number);
  },
  transactions: function(tx, index, self) {
    if (index > MAX_ELEMENTS) {
      return false;
    }
    return index === self.findIndex((t) => (
      t.blockNumber === tx.blockNumber && t.transactionIndex === tx.transactionIndex
    ));
  },
  ensRecords: function(record, index, self) {
    return record.name && record.address && record.address !== VOID_ADDRESS && index === self.findIndex((r) => (
      r.address === record.address && r.name === record.name
    ));
  },
  files: function(file, index, self) {
    return index === self.findIndex((f) => (
      file.name === f.name
    ));
  },
  gasOracleStats: function(stat, index, _self) {
    return index === 0; // Only keep last one
  },
  versions: function(version, index, self) {
    return index === self.findIndex((v) => v.value === version.value && v.name === version.name);
  }
};

function entities(state = entitiesDefaultState, action) {
  if (action.type === FILES[SUCCESS]) {
    return {...state, files: action.files};
  }
  for (let name of Object.keys(state)) {
    let filter = filtrer[name] || (() => true);
    let sort = sorter[name] || (() => true);
    if (action[name] && action[name].length > 1) {
      return {...state, [name]: [...action[name], ...state[name]].sort(sort).filter(filter)};
    }
    if (action[name] && action[name].length === 1) {
      let entity = action[name][0];
      let nested = Object.keys(state).reduce((acc, entityName) => {
        if (entity[entityName] && entity[entityName].length > 0) {
          let entityFilter = filtrer[entityName] || (() => true);
          let entitySort = sorter[entityName] || (() => true);
          acc[entityName] = [...entity[entityName], ...state[entityName]].sort(entitySort).filter(entityFilter);
        }
        return acc;
      }, {});
      return {
        ...state, ...nested, [name]: [...action[name], ...state[name]].sort(sort).filter(filter)
      };
    }
  }

  return state;
}

function errorMessage(_state = null, action) {
  return action.error || null;
}

function errorEntities(state = {}, action) {
  if (!action.type.endsWith(SUCCESS)) {
    return state;
  }
  let newState = {};
  for (let name of Object.keys(entitiesDefaultState)) {
    if (action[name] && action[name].length > 0) {
      newState[name] = action[name][0].error;
    }
  }
  return {...state, ...newState};
}

function loading(_state = false, action) {
  return action.type.endsWith(REQUEST) && !action.noLoading;
}

function compilingContract(state = false, action) {
  if (action.type === CONTRACT_COMPILE[REQUEST]) {
    return true;
  } else if (action.type === CONTRACT_COMPILE[FAILURE] || action.type === CONTRACT_COMPILE[SUCCESS]) {
    return false;
  }

  return state;
}

const DEFAULT_CREDENTIALS_STATE = {host: DEFAULT_HOST, token: '', authenticated: false};

function credentials(state = DEFAULT_CREDENTIALS_STATE, action) {
  if (action.type === LOGOUT[SUCCESS]) {
    return DEFAULT_CREDENTIALS_STATE;
  }

  if (action.type === AUTHENTICATE[FAILURE]) {
    return {error: action.error, authenticated: false};
  }

  if (action.type === AUTHENTICATE[SUCCESS]) {
    return {...state, ...{authenticated: true, token: action.token, host: action.host, error: null}};
  }

  if (action.type === FETCH_CREDENTIALS[SUCCESS]) {
    return {...state, ...{token: action.token, host: action.host}};
  }

  return state;
}

function baseEther(state = '1', action) {
  if (action.type === UPDATE_BASE_ETHER) {
    return action.payload;
  }
  return state;
}

const rootReducer = combineReducers({
  entities,
  loading,
  compilingContract,
  errorMessage,
  errorEntities,
  credentials,
  baseEther
});

export default rootReducer;
