import React, { useReducer, useState, useEffect } from 'react';
import {
  Box,
  ChakraProvider,
  Center,
  VStack,
  Button,
  Divider,
} from '@chakra-ui/react';
import Ipfs from 'ipfs';

import { Reducer, GlobalContext } from "./contexts/GlobalContext";
import Web3Connection from "./components/Web3Connection";
import MakeTimeCapsule from "./components/MakeTimeCapsule";
import CheckTimeCapsule from "./components/CheckTimeCapsule";

function App() {
  const initialState = {
  };
  const [state, dispatch] = useReducer(Reducer, initialState);
  const [checkTC, setCheckTC] = useState(false);
  const [makeTC, setMakeTC] = useState(false);

  useEffect(()=>{
    const setUpIpfs=async()=>{
      try{
        let ipfs = await Ipfs.create({
          relay: {enabled: true, hop: {enabled: true, active: true}},
          repo: "ipfs-cp"
          });
        dispatch({type:'SET_IPFS', payload: ipfs});
      }catch(err){
      }
    };

    setUpIpfs();
  },[]);

  return (
    <GlobalContext.Provider value={[state,dispatch]}>
      <ChakraProvider>
        <Center h="15vh">
          <VStack>
            <Box fontWeight='bold' fontSize='30px'>Ethereum Time Capsule</Box>
            <Box pl={400}>powered by Rinkeby</Box>
          </VStack>
        </Center>
        <Divider/>
        {!state.error
        ? <Center h="60vh">
            <VStack style={{textAlign: 'center', fontWeight: 'bold',}}>
            {state.provider?
              !checkTC&&!makeTC ? 
                <VStack>
                  <Button my={5} onClick={()=>{setCheckTC(true)}}>
                    Check your Time Capsules
                  </Button>
                  <Button my={5} onClick={()=>{setMakeTC(true)}}>
                    Make a new Time Capsule
                  </Button>
                </VStack>
              :checkTC&&!makeTC ?
                <CheckTimeCapsule
                  back={()=>{setCheckTC(false)}} 
                  change={()=>{setCheckTC(false); setMakeTC(true)}}/>
              :makeTC&&!checkTC ?
                <MakeTimeCapsule
                  back={()=>{setMakeTC(false)}} 
                  change={()=>{setMakeTC(false); setCheckTC(true)}}/>
              :<p>Give it a few miliseconds</p>
            : <Web3Connection/>}
            </VStack>
          </Center>
        : <Center h="60vh">
            <Box>
              {state.error.message}
            </Box>
          </Center>}
      </ChakraProvider>
    </GlobalContext.Provider>
  );
}

export default App;
