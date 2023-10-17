import { useState } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';

interface IChatBotProps {
  onSendMessage: (message: string) => void;
}

function ChatBotComponent({ onSendMessage }: IChatBotProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
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
    onSendMessage: (message: string) => void;
  
    constructor(onSendMessage: (message: string) => void) {
      super();
      this.onSendMessage = onSendMessage;
    }
  
    render() {
      return <ChatBotComponent onSendMessage={this.onSendMessage} />;
    }
  }
  
export default ChatBotWidget;


