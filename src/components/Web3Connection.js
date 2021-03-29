import React, { useContext } from 'react';
import {
  VStack,
  Button,
} from '@chakra-ui/react';
import {ethers} from 'ethers';

import { GlobalContext } from '../contexts/GlobalContext';

const contractAddress = '0x6a3EbB3C33eD03a00995b39E870Ba09C2E93BcE4';
const contractABI = require('../abis/TimeCapsule.json').abi;

const Web3Connection=()=>{
  const [state, dispatch] = useContext(GlobalContext);

  const browserWalletConnect = async () => {
    try{
      if(window.ethereum) { await window.ethereum.enable() }
      const web3provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = (await web3provider.getNetwork()).chainId;
      if(chainId===4){
        //set provider
        dispatch({type: 'SET_WEB3', payload: web3provider});

        //set instance
        let signer = await web3provider.getSigner();
        let contract = new ethers.Contract(contractAddress, contractABI, signer);
        dispatch({type: 'SET_CONTRACT', payload: contract});
      } else {
        window.alert('Not Using Rinkeby. Please reconnect using a wallet connected to the Rinkeby network');
      }
    } catch(err){
      dispatch({type: 'SET_ERROR', payload: 'Connection to Wallet Failed'});
      window.alert('Connection Failed');
    }
  }

  return(
    <VStack>
      <Button w='200px' onClick={browserWalletConnect}>
        Connect to Wallet
      </Button>
    </VStack>
  )
}

export default Web3Connection;