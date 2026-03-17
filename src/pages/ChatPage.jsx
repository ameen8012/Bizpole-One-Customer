import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

const ChatSidebar = ({ conversations, selectedChat, setSelectedChat }) => {
  return (
    <div className="w-74 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center bg-yellow-400 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-800 font-semibold">Messages</span>
          <button className="text-gray-700">▼</button>
          <span className="bg-white text-blue-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {conversations.length}
          </span>
        </div>
        <button className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-50">
          <Plus size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 pt-4">
        <div className="bg-white rounded-lg flex items-center px-3 py-2">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search messages"
            className="bg-transparent outline-none text-sm text-gray-600 w-full"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedChat(conv.name)}
            className={`px-4 py-3 cursor-pointer transition-colors ${selectedChat === conv.name ? 'bg-gray-300' : 'hover:bg-gray-200'
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-white flex-shrink-0">
                {conv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {conv.name}
                  </span>
                  <span className="text-xs text-gray-600 ml-2">{conv.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conv.message}</p>
                {conv.badge && (
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${conv.badge === 'Requested'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    {conv.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatWindow = ({ selectedChat, messages, onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-yellow-400 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
            👤
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{selectedChat}</h2>
            <span className="text-xs text-green-600 font-medium">● Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-200">
        {messages[selectedChat]?.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            {msg.sender === 'other' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm flex-shrink-0">
                {msg.avatar}
              </div>
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'user'
                  ? 'bg-yellow-400 text-gray-800'
                  : 'bg-white text-gray-800'
                }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm flex-shrink-0">
                {msg.avatar}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-yellow-400"
          />
          <button
            onClick={handleSend}
            className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState('Florencio / GST');
  const [messages, setMessages] = useState({
    'Florencio / GST': [
      { text: 'this is amazing', sender: 'other', avatar: '👤' },
      { text: 'perfect! ✅', sender: 'other', avatar: '👤' },
      { text: 'About the gst filling', sender: 'user', avatar: '👤' },
      { text: 'ok', sender: 'other', avatar: '👤' }
    ],
    'Lavern Doe / Website dev': [
      { text: 'hello', sender: 'other', avatar: '👤' },
      { text: 'working on it', sender: 'user', avatar: '👤' }
    ],
    'Geoffrey / Auditing': [{ text: 'need docs pls', sender: 'other', avatar: '👤' }],
    'Alfonzo Schuessler / GST': [{ text: 'perfect', sender: 'other', avatar: '👤' }]
  });

  const conversations = [
    { name: 'Lavern Doe / Website dev', message: 'OK thank you', time: '1h', avatar: '👤' },
    { name: 'Florencio / GST', message: 'send GST', time: '24m', avatar: '👤', badge: 'Followup' },
    { name: 'Geoffrey / Auditing', message: '', time: '2d', avatar: '👤', badge: 'Requested' },
    { name: 'Alfonzo Schuessler / GST', message: 'perfect', time: '1m', avatar: '👤', badge: 'Follow up' }
  ];

  const handleSend = (newMsg) => {
    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), { text: newMsg, sender: 'user', avatar: '👤' }]
    }));
  };

  return (
    <div className="flex min-h-[100%] bg-gray-100">
      <ChatSidebar
        conversations={conversations}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />
      <ChatWindow selectedChat={selectedChat} messages={messages} onSend={handleSend} />
    </div>
  );
};

export default ChatPage;
