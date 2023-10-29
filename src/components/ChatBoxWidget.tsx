import { useState } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
interface IChatBotProps {
  onSendMessage: (message: string) => void;
}

function ChatBotComponent() {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim()) {
      // onSendMessage(message);
      setMessage(''); // Clear the input after sending
    }
  };

  return (
      <div>
        <h3>ChatBot</h3>
        <textarea 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSubmit}>Send</button>
      </div>
  );
}

class ChatBotWidget extends ReactWidget {
    // onSendMessage: (message: string) => void;
  
    constructor() {
      super();
      // this.onSendMessage = onSendMessage;
    }
  
    render() {
      return <ChatBotComponent />;
    }
  }
  
export default ChatBotWidget;


