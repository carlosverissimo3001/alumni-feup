
import React, { useEffect, useRef } from 'react';
import WebSocketService from '../helpers/webSocketService';

const WebSocketServiceCmp = () => {
  const socketServiceRef = useRef(null);

  useEffect(() => {
    const socketService = new WebSocketService();
    socketServiceRef.current = socketService;  
    socketServiceRef.current.connect();

    return () => {
      //socketServiceRef.current.disconnect();
    };
  }, []);

};

export default WebSocketServiceCmp;
