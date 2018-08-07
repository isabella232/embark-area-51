import {combineReducers} from 'redux';
import processesReducer from './processesReducer';
import accountsReducer from './accountsReducer';
import blocksReducer from './blocksReducer';
import transactionsReducer from './transactionsReducer';
import commandsReducer from './commandsReducer';
import contractsReducer from './contractsReducer';
import contractReducer from './contractReducer';
import contractProfileReducer from './contractProfileReducer';

const rootReducer = combineReducers({
  accounts: accountsReducer,
  processes: processesReducer,
  contracts: contractsReducer,
  contract: contractReducer,
  contractProfile: contractProfileReducer,
  blocks: blocksReducer,
  transactions: transactionsReducer,
  commands: commandsReducer,
  contracts: contractsReducer,
  contract: contractReducer
});

export default rootReducer;
