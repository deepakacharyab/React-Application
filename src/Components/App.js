import React, { useEffect } from 'react'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { useState } from 'react';
import {Modal, Button} from "react-bootstrap"
import {useLocalStorage, writeStorage } from '@rehooks/local-storage';
import Tabs from "./Tabs";
import {Form} from './FormSubmit';
import StatusTable from './StatusTable';
import ModalTable from './ModalTable';
import ReactLoading from 'react-loading';
import {onGetResultClick, getStatusAll } from '../Api_folder/Api';


//Base file when I try to call the status and form submission components
function App() {
  const [modalInfo, setModalInfo] = useState('');
  const[mystate,setMyState] = useState([]);
  const [show, setShow] = useState(false);
  const [flagStatus, setFlagStatus] = useState();
  const [getItem, setItem] = useLocalStorage('elem');
  const [showSpinner, setShowSpinner] = useLocalStorage('spin')
  const [showStatusSpinner, setShowStatusSpinner] = useLocalStorage('spinStatus')
  const [status, setStatus] = useLocalStorage('statusFetch');
  const [modalStatus, setModalStatus] = useLocalStorage('modal');

  const handleClose = () => {setShow(false); setModalStatus(false)};
  const handleShow = () => {setShow(true); setModalStatus(true)};

  // status row click result code
  let onGetResult = async (param) => {
    setShowStatusSpinner(0); 
    await onGetResultClick(param) .then((res) => {setMyState(res);}).catch((err) => {console.error(err);})
    setShowStatusSpinner(1);
    setModalInfo('Status Modal');
    handleShow(); 
  };

  // Modal display code
  const ModalContent = () => {
    return (
      <Modal dialogClassName="my-modal" show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{modalInfo}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <ModalTable columns={resultColumn} data={mystate} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
            Close
            </Button>
          </Modal.Footer>
      </Modal>
    )
  };

  // Table headers
  const resultColumn = React.useMemo(
    () => [
      {
        Header: 'Data',
        accessor: 'dataElement',
      },
      {
        Header: 'Period',
        accessor: 'period',
      },
      {
        Header: 'Org Unit',
        accessor: 'orgUnit',
      },
      {
        Header: 'Value',
        accessor: 'value',
      }
    ],
    []
  )
  
  const statusColumns = React.useMemo(
    () => [
      {
        Header: 'Request ID',
        accessor: 'request_id',
      },
      {
        Header: 'Dataset',
        accessor: 'dataset',
      },
      {
        Header: 'Type',
        accessor: 'type',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Status Message',
        accessor: 'message',
      },
      {
        Header: 'CREATED TIME',
        accessor: 'creation_time',
      },
      {
        Header: 'Lookup Result',
        accessor:"name",
        Cell: ({ cell }) => (
          <button onClick={ (e) => onGetResult(cell.row.values.request_id)} className = 'stsBtn' disabled={cell.row.values.status !== 'success'}>
            {cell.row.values.dataset}
          </button>
        )
      },
    ],
    []
  )
    // making sure that the local storage is init to default value
   if (!localStorage.getItem("ids")){
    localStorage.setItem("ids","[]")
   }
   if(!localStorage.getItem("statusFetch")){
    setStatus([])
  }
  if(!localStorage.getItem("modal")){
    setModalStatus(false)
  }
  if(!localStorage.getItem("elem")){
    setItem(0);
  }

  const getStatus = async (spinFlag) => {
    var localIds = localStorage.getItem("ids");
    setShowSpinner(1);
    if(spinFlag === 1 || spinFlag === "r") setShowStatusSpinner(0);
    await getStatusAll(localIds) .then((res) => {setStatus(res);}).catch((err) => {console.error(err);})
    if(spinFlag === 1 || spinFlag === "r" ) setShowStatusSpinner(1);
    if (JSON.parse(localStorage.getItem("statusFetch")).filter(e => e.status !== 'success').length > 0) {
        setFlagStatus(true);
    }else{
      setFlagStatus(false);
    }
    setItem(0);
    if(spinFlag === "r") {writeStorage("refresh", 0);writeStorage("delSet", 0)};
  }  

  // To render the code every 5 seconds depending on the reqirement(not always)
  useEffect ( () => {
    if((localStorage.getItem("modal") === "false" && flagStatus) || (localStorage.getItem("elem") === "0" && JSON.parse(localStorage.getItem('ids')).length > 0)) getStatus(1);
   
    const interval = setInterval(() => {
      if((localStorage.getItem("modal") === "false" && flagStatus)|| localStorage.getItem("elem") === "1" ) getStatus(0)
    }, 5000);
   return () => clearInterval(interval);
  
  },[flagStatus])
  
  useEffect ( () => {
    const interval = setInterval(() => {
      if(localStorage.getItem("refresh") === "1") getStatus("r");
    }, 2000);
   return () => clearInterval(interval);
  },[])

  // Rendering component
  return (    
    <Tabs>
    <div label="STATUS">
    <div className="banner"> PLEASE CLICK ON FORM SUBMISSION TAB TO CREATE A NEW REQUEST ID</div>
      <StatusTable columns={statusColumns} data={JSON.parse(localStorage.getItem("statusFetch"))} page2={localStorage.getItem("pageIndexCheck")}/>
      {show? <ModalContent/>:null}
      <div className={localStorage.getItem("spinStatus") === "0"?'spin':""}> 
        {localStorage.getItem("spinStatus") === "0"?<ReactLoading type={'spin'} color={'#88a9af'} height={250} width={250} />:null} 
      </div>
      
    </div>
    <div label="FORM SUBMISSION">
    <Form/>
      <div className={localStorage.getItem("spin") === "0"?'spin':""}> 
        {localStorage.getItem("spin") === "0"?<ReactLoading type={'spin'} color={'#88a9af'} height={250} width={250} />:null} 
      </div>
    </div>
  </Tabs>
  )
}

export default App
