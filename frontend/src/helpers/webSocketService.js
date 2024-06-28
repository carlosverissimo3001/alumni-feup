class WebSocketService {
    constructor() {
      this.socket = null;
    }
  
    connect() {
      const host = window.location.host; // Get current host dynamically
      console.log("host: ", host);
      this.socket = new WebSocket(`wss://${host}/ws`);
  
      this.socket.onopen = () => {
        console.log('WebSocket connected');
      };
  
      this.socket.onmessage = (event) => {
        console.log('Message from server:', event.data);
        // Handle incoming messages from the WebSocket server
      };
  
      this.socket.onclose = () => {
        console.log('WebSocket closed');
      };
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    }
  
    sendMessage(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.error('WebSocket is not connected.');
      }
    }
  }
  
  export default WebSocketService;
  