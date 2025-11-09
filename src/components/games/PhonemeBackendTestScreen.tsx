import { useState, useRef } from 'react';
import { ArrowLeft, Mic, Volume2, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { phonemeApi } from '../../api/vocabulary';

interface PhonemeBackendTestScreenProps {
  onNavigate: (screen: string) => void;
}

interface AnalysisResult {
  sentence: string;
  ipa: string;
  overall_score: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    score: number;
    color: 'green' | 'red';
    phonemes?: any[];
  }>;
  per_phoneme?: any[];
  heatmap?: string;
  error?: string;
}

export function PhonemeBackendTestScreen({ onNavigate }: PhonemeBackendTestScreenProps) {
  const [referenceSentence, setReferenceSentence] = useState("I've been doing a lot of outdoor activities.");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordedAudioBlob(null);
      setAnalysisResult(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        
        // Automatically analyze after recording stops
        if (referenceSentence.trim()) {
          await analyzeRecording(audioBlob);
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      if (!referenceSentence.trim()) {
        setError('Please enter a reference sentence first');
        return;
      }
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handlePlayRecorded = () => {
    if (!recordedAudioBlob) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const audioUrl = URL.createObjectURL(recordedAudioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
      setError('Failed to play recorded audio');
    };
    
    audio.play();
  };

  const analyzeRecording = async (audioBlob: Blob) => {
    if (!referenceSentence.trim()) {
      setError('Please enter a reference sentence');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Convert webm to wav format (simplified - backend should handle webm)
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const result = await phonemeApi.analyzeSentence(audioFile, referenceSentence.trim());
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error analyzing recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!recordedAudioBlob) {
      setError('Please record audio first');
      return;
    }
    await analyzeRecording(recordedAudioBlob);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-indigo-50 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Phoneme Backend Test</h2>
          <div className="w-10" />
        </div>

        {/* Server Status Info */}
        <Card className="w-full p-4 mb-6 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2 text-blue-700">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Server Setup Required:</p>
              <p className="mb-2">Make sure the Phoneme Backend server is running on port 8001:</p>
              <code className="block bg-blue-100 p-2 rounded text-xs mb-2">
                cd phoneme_backend<br />
                source venv/bin/activate<br />
                uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
              </code>
              <p className="text-xs opacity-80">Note: CORS has been configured in the backend to allow requests from this app.</p>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="w-full p-4 mb-6 bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* Reference Sentence Input */}
        <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Reference Sentence</h3>
          <input
            type="text"
            value={referenceSentence}
            onChange={(e) => setReferenceSentence(e.target.value)}
            placeholder="Enter the sentence you want to practice..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
            disabled={isRecording || isProcessing}
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter the sentence you want to practice. The system will analyze your pronunciation against this reference.
          </p>
        </Card>

        {/* Recording Section */}
        <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Recording
          </h3>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={handleRecord}
              disabled={isProcessing || !referenceSentence.trim()}
              className={`w-24 h-24 rounded-full flex items-center justify-center p-0 ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse hover:from-red-500 hover:to-orange-500'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Mic className="w-8 h-8 text-white" />
            </Button>
            
            {recordedAudioBlob && (
              <Button
                onClick={handlePlayRecorded}
                disabled={isProcessing}
                className="w-12 h-12 rounded-full flex items-center justify-center p-0 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Volume2 className="w-6 h-6 text-white" />
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-16 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-3 h-8 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mt-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm">Analyzing your pronunciation... This may take a minute.</p>
            </div>
          )}

          {recordedAudioBlob && !isProcessing && !analysisResult && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleAnalyze}
                disabled={!referenceSentence.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Analyze Again
              </Button>
            </div>
          )}
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Analysis Results
            </h3>

            {/* Overall Score */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Overall Score</span>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${
                    analysisResult.overall_score >= 0.70 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(analysisResult.overall_score * 100).toFixed(1)}%
                  </span>
                  {analysisResult.overall_score >= 0.70 ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Sentence with IPA */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Sentence</p>
              <p className="text-xl text-gray-800 mb-2">{analysisResult.sentence}</p>
              {analysisResult.ipa && (
                <>
                  <p className="text-sm font-semibold text-gray-700 mb-2">IPA Transcription</p>
                  <p className="text-lg text-gray-600 font-mono">{analysisResult.ipa}</p>
                </>
              )}
            </div>

            {/* Words with Color Coding */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Word-by-Word Analysis</p>
              <div className="flex flex-wrap items-center gap-2 text-lg leading-relaxed">
                {analysisResult.words.map((word, idx) => {
                  const isGood = word.color === 'green';
                  const bgColor = isGood ? 'bg-green-100' : 'bg-red-100';
                  const textColor = isGood ? 'text-green-800' : 'text-red-800';
                  const borderColor = isGood ? 'border-green-300' : 'border-red-300';
                  
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-3 py-1.5 rounded-lg border-2 ${bgColor} ${textColor} ${borderColor} font-semibold transition-all hover:scale-105 cursor-pointer`}
                      title={`Score: ${(word.score * 100).toFixed(1)}%`}
                    >
                      {word.word}
                      <span className="ml-2 text-xs opacity-75">
                        ({(word.score * 100).toFixed(0)}%)
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Detailed Word Scores */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-3">Detailed Scores</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analysisResult.words.map((word, idx) => {
                  const isGood = word.color === 'green';
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        isGood
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${
                          isGood ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {word.word}
                        </span>
                        {isGood ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className={`text-sm font-bold ${
                        isGood ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {(word.score * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
