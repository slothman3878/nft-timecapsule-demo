import { createContext } from 'react';

export const Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_WEB3':
      return{
        ...state,
        provider: action.payload
      };
    case 'SET_CONTRACT':
      return{
        ...state,
        contract: action.payload
      };
    case 'SET_IPFS':
      return{
        ...state,
        ipfs: action.payload
      }
    case 'SET_ERROR':
      return{
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

export const GlobalContext = createContext();