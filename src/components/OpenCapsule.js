import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Button,
  Textarea,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import {ethers} from 'ethers';

import { GlobalContext } from '../contexts/GlobalContext';
import DatePicker from './DatePicker';
import { toMonth } from '../helpers/DateHelper';

const OpenCapsule=(props)=>{
  const [state,dispatch] = useContext(GlobalContext);
  const [connecting, setConnecting] = useState(true);
  const [message, setMessage] = useState();
  const [fee, setFee] = useState(0);
  const [newdate, setNewdate] = useState(new Date());

  useEffect(() => {
    opencapsule();
  }, [])

  const opencapsule=async()=>{
    let uri;
    try{
      uri = await state.contract.tokenURI(props.token.id);
      let data = await fetch(`https://ipfs.io/ipfs/${uri}`);
      let blob = await data.blob();
      let arrayBuffer = await blob.arrayBuffer();
      setMessage(String.fromCharCode.apply(null, new Uint16Array(arrayBuffer)));
    }catch(err){
      dispatch({type: 'SET_ERROR', payload: err})
    }
    setConnecting(false);
  };

  const changeDueDate=async()=>{
    setConnecting(true);
    try{
      (await state.contract.resetDueDate(
        props.token.id,
        ethers.BigNumber.from(Math.floor(newdate.getTime()/1000)),
        ethers.BigNumber.from(fee),
        {value: ethers.BigNumber.from(fee)}
      )).wait().then((receipt)=>{
        opencapsule();
      });
    }catch(err){
      if(err.message==='MetaMask Tx Signature: User denied transaction signature.'){
        window.alert('User denied transaction');
      }
      else{
        window.alert('Your fee is too low!!! Use calculate fee to see how much you need to pay in order to move up the due date to what was selected.');
      }
      setConnecting(false);
    }
  }

  const calculateFee=async()=>{
    let inGwei = (await state.contract.calculateResetFee(
      props.token.id,
      ethers.BigNumber.from(Math.floor(newdate.getTime()/1000))
    ));
    setFee(inGwei);
  }

  return(
    <Box>
      <Box>{props.token.title}</Box>
      {!connecting
      ? message
        ? <Box>
            <Box w="800px" my={5}>
              <Textarea            
                h='300px'
                value={message}
                size='sm'
                resize='vertical'
                isReadOnly/>
            </Box>
          </Box>
        : <Box>
            <Box>
              This capsule cannot be opened until&nbsp;
              {toMonth(props.token.dueDate.getMonth())}&nbsp;
              {props.token.dueDate.getDate()},&nbsp;
              {props.token.dueDate.getFullYear()}.
            </Box>
            <Box w="400px" mb={4}>But you can move up or push back the due date by paying a fee.</Box>
            <HStack>
              <Box>New due date: </Box>
              <Box w="20px"></Box>
              <DatePicker selected={newdate} onChange={(date)=>setNewdate(date)}/>
            </HStack>
            <Box h="4px"></Box>
            <HStack>
              <Box>Fee: </Box>
              <Box w="90px"></Box>
              <NumberInput value={fee/1e18} precision={7}>
                <NumberInputField />
              </NumberInput>
            </HStack>
            <HStack my={5}>
              <Button onClick={changeDueDate}>Change Due Date</Button>
              <Box w="100px"></Box>
              <Button onClick={calculateFee}>Calculate Fee</Button>
            </HStack>
          </Box>
      : <Box>
          <Box my={5}>Connecting...</Box>
        </Box>}
      <Button onClick={props.back}>Back</Button>
    </Box>
  )
}

export default OpenCapsule;