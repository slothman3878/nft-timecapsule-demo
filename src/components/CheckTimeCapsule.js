import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Button,
} from '@chakra-ui/react';

import { GlobalContext } from '../contexts/GlobalContext';
import OpenCapsule from './OpenCapsule';
import { toMonth } from '../helpers/DateHelper';

const CheckTimeCapsule=(props)=>{
  const [state,dispatch] = useContext(GlobalContext);
  const [tokenlist, setTokenlist] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [open, setOpen] = useState();

  useEffect(() => {
    const getTimeCapsuleList=async()=>{
      let address = await (await state.provider.getSigner()).getAddress();
      setConnecting(true);
      const newtokenlist=[];
      var loop = true;
      for(var i=0;loop;i++){
        try{
          let tokenId = (await state.contract.tokenOfOwnerByIndex(address, i)).toNumber();
          let dueDate = new Date((await state.contract.dueDate(tokenId)).toNumber()*1000);
          let creationDate = new Date((await state.contract.creationDate(tokenId)).toNumber()*1000);

          let uri = await state.contract.viewTitle(tokenId);
          let data = await fetch(`https://ipfs.io/ipfs/${uri}`);
          let blob = await data.blob();
          let arrayBuffer = await blob.arrayBuffer();
          let title = String.fromCharCode.apply(null, new Uint16Array(arrayBuffer));

          newtokenlist.push({id: tokenId, dueDate: dueDate, creationDate: creationDate, title: title});
        }catch(err){
          loop = false;
        }
      }
      setTokenlist(newtokenlist);
      setConnecting(false);
    };

    getTimeCapsuleList();
  }, [])

  return(
    open? <OpenCapsule token={open} back={()=>setOpen(false)}/>
    : <Box>
        <Box my={5}>
            {connecting?<Box>Connecting...</Box>
            : tokenlist.length===0
              ? <VStack>
                  <Box my={3}>You have no Time Capsules</Box>
                  <Button onClick={props.change}>Make a Time Capsule</Button>
                </VStack>
              : <VStack>
                  {tokenlist.map((token, key)=>{
                    return <Button onClick={()=>setOpen(token)}>
                      {token.title}&nbsp;
                       from&nbsp;
                       {toMonth(token.creationDate.getMonth())}&nbsp;
                       {token.creationDate.getDate()},&nbsp;
                       {token.creationDate.getFullYear()}
                    </Button>
                  })}
                </VStack>}
        </Box>
        <Button onClick={props.back}>Back</Button>
      </Box>
  );
}

export default CheckTimeCapsule;