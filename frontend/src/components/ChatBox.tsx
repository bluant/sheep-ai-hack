import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {getAskStream, getChatStream, readStream} from '../services/api';
import './ChatBox.css';

interface ChatBoxProps {
  className?: string;
  type?: 'general' | 'ragged';
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  isComplete: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ className = '', type = 'general' }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mutation for sending chat messages
  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      let stream;
      if(type === 'general') {
        stream = await getChatStream(question);
      } else {
        stream = await getAskStream(question);

      }
      return stream;
    },
    onSuccess: (stream) => {
      // Create a new message for the AI response
      const messageId = Date.now().toString();
      setMessages(prev => [
        ...prev, 
        { id: messageId, content: '', isUser: false, isComplete: false }
      ]);

      // Process the stream
      readStream(
        stream,
        (chunk) => {
          // Update the AI message with each new chunk
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: msg.content + chunk } 
                : msg
            )
          );
        },
        () => {
          // Mark the message as complete when the stream ends
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, isComplete: true } 
                : msg
            )
          );
        }
      );
    },
    onError: (error) => {
      console.error('Chat error:', error);
      // Add an error message
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          isUser: false, 
          isComplete: true 
        }
      ]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev, 
      { id: Date.now().toString(), content: question, isUser: true, isComplete: true }
    ]);

    // Send to API
    chatMutation.mutate(question);

    // Clear input
    setQuestion('');
  };

  return (
      <div className={`chat-box ${className}`}>
        <div className="title-container">Chatbox type: {type.toUpperCase()}</div>
        <div className="messages-container">
          {messages.length === 0 ? (
              <div className="empty-state">
                Ask a question to start the conversation
              </div>
          ) : (
              messages.map((message) => (
                  <div
                      key={message.id}
                      className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-content">
                      {message.content || (message.isComplete ? '' : 'Thinking...')}
                      {!message.isComplete && !message.isUser && (
                          <span className="typing-indicator">▌</span>
                      )}
                    </div>
                  </div>
              ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              disabled={chatMutation.isPending}
              className="question-input"
          />
          <button
              type="submit"
              disabled={chatMutation.isPending || !question.trim()}
              className="submit-button"
          >
            {chatMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
  );
};
