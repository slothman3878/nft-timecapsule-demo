import React, { useContext, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
} from '@chakra-ui/react';
import {ethers} from 'ethers';

import { GlobalContext } from '../contexts/GlobalContext';
import DatePicker from '../components/DatePicker'

const MakeTimeCapsule=(props)=>{
  const [state, dispatch] = useContext(GlobalContext);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(0);

  const makeTimeCapsule = async() => {
    if(title.length>60){ window.alert('Your title is too long. It should be less than 60 characters'); }
    else {
      setSubmitting(1);
        try{
          let msgblob = new Blob([strEncodeUTF16(message).buffer])
          let titleblob = new Blob([strEncodeUTF16(title).buffer]);
          let msgHash = (await state.ipfs.add(msgblob,{})).path;
          let titleHash = (await state.ipfs.add(titleblob,{})).path;
          (await state.contract.registerTimeCapsule(
            ethers.BigNumber.from(Math.floor(dueDate.getTime()/1000)),
            msgHash,
            titleHash
            )).wait().then(async(receipt)=>{
              setSubmitting(2);
            });
        }catch(err){
          window.alert(err.message);
          if(err.message==='MetaMask Tx Signature: User denied transaction signature.'){
            window.alert('User denied transaction');
          }
          else { dispatch({type:'SET_ERROR', payload: err}); }
        }
    }
  }

  const strEncodeUTF16=(str)=>{
    var buf = new ArrayBuffer(str.length*2);
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
  }

  return(
    <Box w='800px'>
      {submitting===1 ? <VStack>
          <Box>Submitting...</Box>
          <Box>If this takes longer than usual, comeback after the transaction has been finished</Box>
        </VStack>
      : submitting===0 ? 
        <Box>
          <Input
            size='md'
            resize='none'
            placeholder='title'
            value={title}
            onChange={(e)=>{setTitle(e.target.value)}}
          />
          <Box h="2px"></Box>
          <Textarea
            h='300px'
            value={message}
            onChange={(e)=>{setMessage(e.target.value)}}
            placeholder='Write to your future!'
            size='sm'
            resize='none'
          />
          <HStack py={2}>
            <Box pl={5}>Select Duedate: </Box>
            <DatePicker selected={dueDate} onChange={(date)=>setDueDate(date)}/>
            <Box pl={300}>
              <Button onClick={makeTimeCapsule}>
                Submit
              </Button>
            </Box>
          </HStack>
          <Button onClick={props.back}>Back</Button>
        </Box>
      : submitting===2 ?
        <VStack>
          <Box pb={5}>Submitted</Box>
          <Button onClick={props.change}>Check your Time Capsules</Button>
        </VStack>
      : <Box>Something is Wrong</Box>}
    </Box> 
  )
}

export default MakeTimeCapsule;