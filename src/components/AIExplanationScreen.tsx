import { ArrowLeft, Send, BookOpen, List, Lightbulb } from 'lucide-react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useState } from 'react';

interface AIExplanationScreenProps {
  onNavigate: (screen: string) => void;
}

export function AIExplanationScreen({ onNavigate }: AIExplanationScreenProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Hi! I can help explain any English chunk or phrase. What would you like to know?',
    },
  ]);

  const handleSend = () => {
    if (!question.trim()) return;

    setMessages([
      ...messages,
      { id: messages.length + 1, type: 'user', text: question },
      {
        id: messages.length + 2,
        type: 'ai',
        text: '"Get along" and "get on" are very similar! Both mean to have a good relationship with someone. "Get along with" is more common in American English, while "get on with" is more common in British English. They can be used interchangeably in most contexts.',
      },
    ]);
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-gray-800">AI Helper</h2>
          <Lightbulb className="w-6 h-6 text-purple-500" />
        </div>

        {/* Chunk Display */}
        <Card className="mb-6 p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
          <h3 className="text-gray-900 text-center mb-2">get along with</h3>
          <p className="text-gray-600 text-center">
            means to have a good relationship with someone
          </p>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="meaning" className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur border-0 shadow-md">
            <TabsTrigger value="meaning" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Meaning
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <List className="w-4 h-4 mr-2" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="similar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              Similar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meaning" className="mt-4">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-md">
              <h4 className="text-gray-900 mb-3">Definition</h4>
              <p className="text-gray-700 mb-4">
                "Get along with" is a phrasal verb that means to have a friendly or harmonious relationship with someone.
              </p>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-gray-700">
                  <span className="text-purple-600">💡 Usage tip:</span> This phrase is commonly used in both casual and professional contexts.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="mt-4">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-md">
              <h4 className="text-gray-900 mb-3">Example Sentences</h4>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-400 pl-4">
                  <p className="text-gray-800">I get along with my coworkers really well.</p>
                  <p className="text-gray-500 mt-1">Tôi có quan hệ rất tốt với đồng nghiệp.</p>
                </div>
                <div className="border-l-4 border-pink-400 pl-4">
                  <p className="text-gray-800">She doesn't get along with her neighbors.</p>
                  <p className="text-gray-500 mt-1">Cô ấy không hòa thuận với hàng xóm.</p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <p className="text-gray-800">Do you get along with your siblings?</p>
                  <p className="text-gray-500 mt-1">Bạn có hòa hợp với anh chị em mình không?</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="similar" className="mt-4">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-md">
              <h4 className="text-gray-900 mb-3">Similar Phrases</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-gray-900">get on with</p>
                  <p className="text-gray-600">British English version, same meaning</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <p className="text-gray-900">be on good terms with</p>
                  <p className="text-gray-600">More formal, same meaning</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-gray-900">hit it off with</p>
                  <p className="text-gray-600">Immediate good connection</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Chat Section */}
        <div className="mb-6">
          <h3 className="text-gray-800 mb-4">Ask AI</h3>
          <div className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-lg mb-4 max-h-64 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-white/80 backdrop-blur border-0 shadow-md"
            />
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
