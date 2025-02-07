import React, { useState, useRef } from 'react';
import { Button, Input, Card, Spacer, Textarea } from '@nextui-org/react';

function Training() {
  const [trainingText, setTrainingText] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null); // To handle API abortion

  const handleTrain = async () => {
    if (!trainingText.trim()) return;

    setIsLoading(true);

    try {
      // Send the training text to the model
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'my-custom-deepseek',
          prompt: `Learn the following text: ${trainingText}`,
          stream: false,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { text: `Learned: ${trainingText}`, sender: 'system' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { text: 'Failed to train the model.', sender: 'system' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { text: input, sender: 'user' }]);
    setInput('');

    abortControllerRef.current = new AbortController(); // Create a new AbortController

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'my-custom-deepseek',
          prompt: `Based on the learned text, answer the following question: ${input}`,
          stream: true,
        }),
        signal: abortControllerRef.current.signal, // Pass the signal for abortion
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const parsedChunk = JSON.parse(chunk);
        aiResponse += parsedChunk.response;

        // Update the last message with the streaming response
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.sender === 'ai') {
            return [...prev.slice(0, -1), { text: aiResponse, sender: 'ai' }];
          } else {
            return [...prev, { text: aiResponse, sender: 'ai' }];
          }
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error:', error);
        setMessages((prev) => [...prev, { text: 'Failed to fetch response.', sender: 'ai' }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null; // Reset the AbortController
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort the ongoing request
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Training Section */}
      <Card className="p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">Train the Model</h1>
        <Spacer y={2} />
        <Textarea
          value={trainingText}
          onChange={(e) => setTrainingText(e.target.value)}
          placeholder="Enter the text you want the model to learn..."
          fullWidth
          minRows={4}
        />
        <Spacer y={2} />
        <Button
          color="primary"
          onPress={handleTrain}
          disabled={isLoading || !trainingText.trim()}
        >
          Train
        </Button>
      </Card>

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <Card
              className={`max-w-[70%] p-4 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : msg.sender === 'system'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {msg.text}
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4 rounded-lg bg-white text-gray-800 flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </Card>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <Card className="p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question based on the learned text..."
            fullWidth
            disabled={isLoading}
          />
          <Button
            type="submit"
            color="primary"
            disabled={isLoading}
          >
            Send
          </Button>
          {isLoading && (
            <Button
              color="error"
              onPress={handleStop}
            >
              Stop
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}

export default Training;