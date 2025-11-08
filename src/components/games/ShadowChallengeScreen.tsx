import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Volume2, RotateCcw, CheckCircle2, XCircle, AlertCircle, X, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { wordApi } from '../../api/vocabulary';
import { shadowingApi } from '../../api/vocabulary';
import { whisperApi } from '../../api/vocabulary';
import { Word, ShadowingResponse, WordComparison, ForcedAlignmentResponse, PhonemeData, WordData } from '../../api/types';

interface ShadowChallengeScreenProps {
  onNavigate: (screen: string) => void;
}

export function ShadowChallengeScreen({ onNavigate }: ShadowChallengeScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shadowingResult, setShadowingResult] = useState<ShadowingResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  
  // Audio visualization data
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [pitchData, setPitchData] = useState<number[]>([]);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  
  // Track all mispronounced words across the challenge
  const [mispronouncedWords, setMispronouncedWords] = useState<Array<{
    word: Word;
    wordComparison: WordComparison;
    shadowingResult: ShadowingResponse;
    index: number;
  }>>([]);
  
  // Track results for each word
  const [wordResults, setWordResults] = useState<Map<number, ShadowingResponse>>(new Map());
  
  // Show summary when challenge is finished
  const [showSummary, setShowSummary] = useState(false);
  
  // Practice modal state
  const [practiceWord, setPracticeWord] = useState<WordComparison | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isPracticeRecording, setIsPracticeRecording] = useState(false);
  const [isPracticeProcessing, setIsPracticeProcessing] = useState(false);
  const [practiceRecordedBlob, setPracticeRecordedBlob] = useState<Blob | null>(null);
  const [isPlayingPractice, setIsPlayingPractice] = useState(false);
  const [practiceResult, setPracticeResult] = useState<ShadowingResponse | null>(null);
  const [phonemeFeedback, setPhonemeFeedback] = useState<ForcedAlignmentResponse | null>(null);
  const [isLoadingPhonemeFeedback, setIsLoadingPhonemeFeedback] = useState(false);
  const [sentencePhonemeFeedback, setSentencePhonemeFeedback] = useState<ForcedAlignmentResponse | null>(null);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const practiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const practiceMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const practiceAudioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const practiceStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const fetchWords = async () => {
      try {
        const response = await wordApi.getAllWords(0, 10, 'id', 'ASC');
        if (response.success && response.data) {
          setWords(response.data.content || []);
        }
      } catch (error) {
        console.error('Error fetching words:', error);
        setError('Failed to load words');
      }
    };
    fetchWords();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (practiceAudioRef.current) {
        practiceAudioRef.current.pause();
        practiceAudioRef.current = null;
      }
      stopRecording();
      stopPracticeRecording();
    };
  }, []);

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const handlePlayOriginal = () => {
    if (!currentWord || !synthRef.current) return;
    
    synthRef.current.cancel();
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const utterance = new SpeechSynthesisUtterance(currentWord.englishWord);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsPlayingOriginal(false);
    utterance.onerror = () => setIsPlayingOriginal(false);
    synthRef.current.speak(utterance);
    setIsPlayingOriginal(true);
  };

  const handlePlayRecorded = () => {
    if (!recordedAudioBlob) return;
    
    // Stop any playing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Create audio element and play recorded audio
    const audioUrl = URL.createObjectURL(recordedAudioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
    };
    
    audio.onerror = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
      setError('Failed to play recorded audio');
    };
    
    audio.play();
    setIsPlaying(true);
  };

  const startRecording = async () => {
    try {
      setError(null);
      setShadowingResult(null);
      setRecordedAudioBlob(null); // Clear previous recording
      setWaveformData([]); // Clear previous visualization
      setPitchData([]); // Clear previous visualization
      setSentencePhonemeFeedback(null); // Clear previous phoneme feedback
      
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
        // Store the recorded audio blob for playback
        setRecordedAudioBlob(audioBlob);
        await processRecording(audioBlob);
        
        // Stop all tracks
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

  // Convert ForcedAlignmentResponse to ShadowingResponse format
  const convertForcedAlignmentToShadowingResponse = (
    forcedAlignment: ForcedAlignmentResponse,
    expectedText: string
  ): ShadowingResponse => {
    // Get transcribed text from the forced alignment response
    const transcribedText = forcedAlignment.sentence || '';
    
    // Split expected text into words
    const expectedWords = expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    // Get words from forced alignment response
    const alignmentWords = forcedAlignment.words || [];
    
    // Create word comparison array
    const wordComparison: WordComparison[] = [];
    let expectedWordIdx = 0;
    let alignmentWordIdx = 0;
    
    // Match expected words with alignment words
    while (expectedWordIdx < expectedWords.length || alignmentWordIdx < alignmentWords.length) {
      const expectedWord = expectedWords[expectedWordIdx];
      const alignmentWord = alignmentWords[alignmentWordIdx];
      
      if (expectedWord && alignmentWord) {
        // Check if words match (case-insensitive)
        const expectedWordLower = expectedWord.toLowerCase();
        const alignmentWordLower = alignmentWord.word_orig?.toLowerCase() || alignmentWord.word?.toLowerCase() || '';
        
        if (expectedWordLower === alignmentWordLower) {
          // Word matches - check if pronunciation is correct
          const isCorrect = alignmentWord.score_type === 'correct' || 
                           (alignmentWord.nativeness_score_user || 0) >= 0.7;
          wordComparison.push({
            status: isCorrect ? '✓' : '✗',
            expectedWord: expectedWord,
            transcribedWord: alignmentWord.word_orig || alignmentWord.word
          });
          expectedWordIdx++;
          alignmentWordIdx++;
        } else {
          // Words don't match - check which one comes first
          // This is a simplified matching - could be improved
          if (expectedWordIdx < expectedWords.length - 1 && 
              expectedWords[expectedWordIdx + 1]?.toLowerCase() === alignmentWordLower) {
            // Missing word
            wordComparison.push({
              status: '−',
              expectedWord: expectedWord,
              transcribedWord: null
            });
            expectedWordIdx++;
          } else {
            // Extra word
            wordComparison.push({
              status: '+',
              expectedWord: null,
              transcribedWord: alignmentWord.word_orig || alignmentWord.word
            });
            alignmentWordIdx++;
          }
        }
      } else if (expectedWord) {
        // Missing word
        wordComparison.push({
          status: '−',
          expectedWord: expectedWord,
          transcribedWord: null
        });
        expectedWordIdx++;
      } else if (alignmentWord) {
        // Extra word
        wordComparison.push({
          status: '+',
          expectedWord: null,
          transcribedWord: alignmentWord.word_orig || alignmentWord.word
        });
        alignmentWordIdx++;
      } else {
        break;
      }
    }
    
    // Calculate accuracy
    const correctCount = wordComparison.filter(c => c.status === '✓').length;
    const totalExpected = expectedWords.length;
    const accuracy = totalExpected > 0 ? (correctCount / totalExpected) * 100 : 0;
    
    // Create feedback message
    const wrongCount = wordComparison.filter(c => c.status === '✗').length;
    const missingCount = wordComparison.filter(c => c.status === '−').length;
    const extraCount = wordComparison.filter(c => c.status === '+').length;
    
    let feedback = `Correct words: ${correctCount}/${totalExpected} (${accuracy.toFixed(1)}%)`;
    if (wrongCount > 0) feedback += `\nWrong/Mispronounced words: ${wrongCount}`;
    if (missingCount > 0) feedback += `\nMissing words: ${missingCount}`;
    if (extraCount > 0) feedback += `\nExtra words: ${extraCount}`;
    
    return {
      transcribedText,
      expectedText,
      accuracy,
      totalExpected,
      totalCorrect: correctCount,
      correctWords: wordComparison
        .map((comp, idx) => comp.status === '✓' ? { word: comp.expectedWord || '', position: idx } : null)
        .filter((w): w is { word: string; position: number } => w !== null),
      wrongWords: wordComparison
        .map((comp, idx) => comp.status === '✗' ? { 
          expected: comp.expectedWord || '', 
          actual: comp.transcribedWord || '', 
          position: idx 
        } : null)
        .filter((w): w is { expected: string; actual: string; position: number } => w !== null),
      missingWords: wordComparison
        .map((comp, idx) => comp.status === '−' ? { word: comp.expectedWord || '', position: idx } : null)
        .filter((w): w is { word: string; position: number } => w !== null),
      extraWords: wordComparison
        .map((comp, idx) => comp.status === '+' ? { word: comp.transcribedWord || '', position: idx } : null)
        .filter((w): w is { word: string; position: number } => w !== null),
      wordComparison,
      feedback
    };
  };

  const processRecording = async (audioBlob: Blob) => {
    if (!currentWord) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      // Use the word's example sentence if available, otherwise use the word itself
      const expectedText = currentWord.exampleSentence || currentWord.englishWord;
      
      // Call forced-alignment API directly
      const forcedAlignmentResponse = await whisperApi.forcedAlignment(
        audioFile,
        expectedText,
        'base.en'
      );
      
      if (forcedAlignmentResponse && forcedAlignmentResponse.success) {
        console.log('Forced alignment result received:', {
          phonemes: forcedAlignmentResponse.phonemes?.length || 0,
          words: forcedAlignmentResponse.words?.length || 0,
          sentence: forcedAlignmentResponse.sentence
        });
        
        // Store the forced alignment response for phoneme-level highlighting
        setSentencePhonemeFeedback(forcedAlignmentResponse);
        
        // Convert to ShadowingResponse format for compatibility with existing UI
        const shadowingResponse = convertForcedAlignmentToShadowingResponse(
          forcedAlignmentResponse,
          expectedText
        );
        
        console.log('Converted shadowing result:', {
          accuracy: shadowingResponse.accuracy,
          wordComparison: shadowingResponse.wordComparison,
          wordComparisonLength: shadowingResponse.wordComparison?.length || 0
        });
        
        setShadowingResult(shadowingResponse);
        
        // Store result for this word
        setWordResults(prev => {
          const newMap = new Map(prev);
          newMap.set(currentIndex, shadowingResponse);
          return newMap;
        });
        
        // Analyze audio for visualization
        if (audioBlob) {
          analyzeAudioForVisualization(audioBlob);
        }
        
        // Track mispronounced words
        if (shadowingResponse.wordComparison) {
          const mispronounced = shadowingResponse.wordComparison.filter(
            comp => comp.status === '✗' || comp.status === '−' || comp.status === '+'
          );
          
          if (mispronounced.length > 0 && currentWord) {
            mispronounced.forEach(comp => {
              setMispronouncedWords(prev => {
                // Check if this word is already in the list
                const exists = prev.some(
                  item => item.word.id === currentWord.id && 
                          item.wordComparison.expectedWord === comp.expectedWord &&
                          item.wordComparison.transcribedWord === comp.transcribedWord
                );
                if (!exists) {
                  return [...prev, {
                    word: currentWord,
                    wordComparison: comp,
                    shadowingResult: shadowingResponse,
                    index: currentIndex
                  }];
                }
                return prev;
              });
            });
          }
        }
      } else {
        setError('Failed to process recording');
      }
    } catch (err) {
      console.error('Error processing recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleNext = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopRecording();
    
    const nextIndex = currentIndex + 1;
    
    // Check if we've finished all words
    if (nextIndex >= words.length) {
      // Show summary
      setShowSummary(true);
    } else {
      setCurrentIndex(nextIndex);
      // Restore result for this word if it exists
      const savedResult = wordResults.get(nextIndex);
      setShadowingResult(savedResult || null);
      // Clear audio blob and visualization when navigating (user can re-record)
      setRecordedAudioBlob(null);
      setWaveformData([]);
      setPitchData([]);
      setSentencePhonemeFeedback(null);
      setError(null);
      setIsRecording(false);
      setIsPlaying(false);
      setIsPlayingOriginal(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopRecording();
      
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      
      // Restore result for this word if it exists
      const savedResult = wordResults.get(prevIndex);
      setShadowingResult(savedResult || null);
      // Clear audio blob and visualization when navigating (user can re-record)
      setRecordedAudioBlob(null);
      setWaveformData([]);
      setPitchData([]);
      setError(null);
      setIsRecording(false);
      setIsPlaying(false);
      setIsPlayingOriginal(false);
    }
  };

  const handleRestartChallenge = () => {
    setCurrentIndex(0);
    setShowSummary(false);
    setMispronouncedWords([]);
    setWordResults(new Map());
    setShadowingResult(null);
    setRecordedAudioBlob(null);
    setWaveformData([]);
    setPitchData([]);
    setSentencePhonemeFeedback(null);
    setError(null);
    setIsRecording(false);
    setIsPlaying(false);
    setIsPlayingOriginal(false);
  };

  // Analyze audio for waveform and pitch visualization using Whisper API
  const analyzeAudioForVisualization = async (audioBlob: Blob) => {
    setIsAnalyzingAudio(true);
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const result = await whisperApi.analyzeAudio(audioFile);
      
      console.log('Audio analysis result:', {
        waveformLength: result.waveform?.length || 0,
        pitchLength: result.pitch?.length || 0,
        waveformSample: result.waveform?.slice(0, 5),
        pitchSample: result.pitch?.slice(0, 5)
      });
      
      setWaveformData(result.waveform || []);
      setPitchData(result.pitch || []);
    } catch (err) {
      console.error('Error analyzing audio:', err);
      setError('Failed to analyze audio for visualization');
      // Clear data on error
      setWaveformData([]);
      setPitchData([]);
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  // Practice modal functions
  const handleOpenPractice = async (wordComp: WordComparison) => {
    // Check for wrong, missing, or extra words
    const status = wordComp.status;
    const isWrongWord = status === '✗' || status === '−' || status === '+';
    
    if (isWrongWord) {
      setPracticeWord(wordComp);
      setIsPracticeModalOpen(true);
      setPracticeResult(null);
      setPracticeRecordedBlob(null);
      setPhonemeFeedback(null);
      
      // Load phoneme feedback if we have the original recording
      if (recordedAudioBlob && wordComp.expectedWord) {
        await loadPhonemeFeedback(recordedAudioBlob, wordComp.expectedWord);
      }
    }
  };

  // Load phoneme-level feedback for a word
  const loadPhonemeFeedback = async (audioBlob: Blob, word: string) => {
    setIsLoadingPhonemeFeedback(true);
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const feedback = await whisperApi.forcedAlignment(audioFile, word, 'base.en');
      setPhonemeFeedback(feedback);
    } catch (err) {
      console.error('Error loading phoneme feedback:', err);
      setError('Failed to load detailed pronunciation feedback');
    } finally {
      setIsLoadingPhonemeFeedback(false);
    }
  };


  const handleClosePractice = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    stopPracticeRecording();
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current = null;
    }
    setIsPracticeModalOpen(false);
    setPracticeWord(null);
    setPracticeResult(null);
    setPracticeRecordedBlob(null);
    setPhonemeFeedback(null);
    setIsLoadingPhonemeFeedback(false);
    setIsPlayingPractice(false);
    setIsPracticeRecording(false);
    setIsPracticeProcessing(false);
  };

  const handlePlayPracticeOriginal = () => {
    if (!practiceWord || !synthRef.current) return;
    
    synthRef.current.cancel();
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current = null;
    }
    
    const wordToPlay = practiceWord.expectedWord || practiceWord.transcribedWord || '';
    const utterance = new SpeechSynthesisUtterance(wordToPlay);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsPlayingPractice(false);
    utterance.onerror = () => setIsPlayingPractice(false);
    synthRef.current.speak(utterance);
    setIsPlayingPractice(true);
  };

  const startPracticeRecording = async () => {
    try {
      setPracticeResult(null);
      setPracticeRecordedBlob(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      practiceStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      practiceMediaRecorderRef.current = mediaRecorder;
      practiceAudioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          practiceAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(practiceAudioChunksRef.current, { type: 'audio/webm' });
        setPracticeRecordedBlob(audioBlob);
        await processPracticeRecording(audioBlob);
        
        if (practiceStreamRef.current) {
          practiceStreamRef.current.getTracks().forEach(track => track.stop());
          practiceStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsPracticeRecording(true);
    } catch (err) {
      console.error('Error starting practice recording:', err);
      setError('Failed to access microphone. Please check permissions.');
      setIsPracticeRecording(false);
    }
  };

  const stopPracticeRecording = () => {
    if (practiceMediaRecorderRef.current && isPracticeRecording) {
      practiceMediaRecorderRef.current.stop();
      setIsPracticeRecording(false);
    }
    
    if (practiceStreamRef.current) {
      practiceStreamRef.current.getTracks().forEach(track => track.stop());
      practiceStreamRef.current = null;
    }
  };

  const processPracticeRecording = async (audioBlob: Blob) => {
    if (!practiceWord) return;
    
    setIsPracticeProcessing(true);
    
    try {
      const audioFile = new File([audioBlob], 'practice_recording.webm', { type: 'audio/webm' });
      const expectedText = practiceWord.expectedWord || '';
      
      if (!expectedText) {
        setError('No expected word to compare');
        return;
      }
      
      // Get phoneme-level feedback
      const feedback = await whisperApi.forcedAlignment(audioFile, expectedText, 'base.en');
      setPhonemeFeedback(feedback);
      
      // Also get word-level feedback for comparison
      const response = await shadowingApi.performShadowing(
        audioFile,
        expectedText,
        'en',
        true
      );
      
      if (response.success && response.data) {
        setPracticeResult(response.data);
      } else {
        setError('Failed to process practice recording');
      }
    } catch (err) {
      console.error('Error processing practice recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to process practice recording');
    } finally {
      setIsPracticeProcessing(false);
    }
  };

  const handlePlayPracticeRecorded = () => {
    if (!practiceRecordedBlob) return;
    
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current = null;
    }
    
    const audioUrl = URL.createObjectURL(practiceRecordedBlob);
    const audio = new Audio(audioUrl);
    practiceAudioRef.current = audio;
    
    audio.onended = () => {
      setIsPlayingPractice(false);
      URL.revokeObjectURL(audioUrl);
      practiceAudioRef.current = null;
    };
    
    audio.onerror = () => {
      setIsPlayingPractice(false);
      URL.revokeObjectURL(audioUrl);
      practiceAudioRef.current = null;
      setError('Failed to play practice recording');
    };
    
    audio.play();
    setIsPlayingPractice(true);
  };

  const handlePracticeRecord = () => {
    if (!isPracticeRecording) {
      startPracticeRecording();
    } else {
      stopPracticeRecording();
    }
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  const expectedText = currentWord.exampleSentence || currentWord.englishWord;
  const accuracy = shadowingResult?.accuracy || null;

  // Show summary screen when challenge is finished
  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-indigo-50 pb-20">
        <div className="max-w-md mx-auto px-6 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                handleRestartChallenge();
              }}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-3 flex-1 mx-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <Progress value={100} className="h-2" />
              </div>
            </div>
            <span className="text-gray-600">{words.length}/{words.length}</span>
          </div>

          {/* Summary Content */}
          <div className="space-y-6">
            {/* Completion Message */}
            <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
              <div className="text-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Challenge Complete!</h2>
                <p className="text-gray-600">
                  You've completed all {words.length} words
                </p>
              </div>
            </Card>

            {/* Mispronounced Words Summary */}
            {mispronouncedWords.length > 0 ? (
              <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Words to Practice ({mispronouncedWords.length})
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Here are all the words you mispronounced during this challenge:
                  </p>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {mispronouncedWords.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">
                            {item.word.englishWord}
                          </h4>
                          {item.word.pronunciation && (
                            <p className="text-sm text-gray-600 mb-2">
                              {item.word.pronunciation}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenPractice(item.wordComparison)}
                          className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600 transition-colors"
                        >
                          Practice
                        </button>
                      </div>
                      
                      <div className="space-y-1">
                        {item.wordComparison.status === '✗' && (
                          <>
                            <p className="text-xs text-gray-600">
                              Expected: <span className="font-semibold text-green-600">{item.wordComparison.expectedWord}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              You said: <span className="font-semibold text-red-600">{item.wordComparison.transcribedWord}</span>
                            </p>
                          </>
                        )}
                        {item.wordComparison.status === '−' && (
                          <p className="text-xs text-yellow-600">
                            Missing: <span className="font-semibold">{item.wordComparison.expectedWord}</span>
                          </p>
                        )}
                        {item.wordComparison.status === '+' && (
                          <p className="text-xs text-blue-600">
                            Extra: <span className="font-semibold">{item.wordComparison.transcribedWord}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="w-full p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
                <div className="text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Perfect Pronunciation!</h3>
                  <p className="text-gray-600">
                    You didn't mispronounce any words. Great job!
                  </p>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleRestartChallenge}
                className="flex-1 py-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Restart Challenge
              </Button>
              <Button
                onClick={() => onNavigate('review')}
                className="flex-1 py-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-indigo-50 pb-20">
      <div className="max-w-md mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
              }
              stopRecording();
              onNavigate('review');
            }}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 flex-1 mx-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <span className="text-gray-600">{currentIndex + 1}/{words.length}</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Word Display */}
          <Card className="w-full p-8 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
              {currentWord.englishWord}
            </h2>
            {currentWord.pronunciation && (
              <p className="text-lg text-gray-600 text-center mb-4">
                {currentWord.pronunciation}
              </p>
            )}
            {expectedText && (
              <p className="text-sm text-gray-500 text-center mb-4 italic">
                "{expectedText}"
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handlePlayOriginal}
                disabled={isPlayingOriginal}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg disabled:opacity-50"
              >
                <Volume2 className="w-6 h-6 text-white" />
              </button>
              <p className="text-gray-600">Listen to native</p>
            </div>
          </Card>

          {/* Waveform Area */}
          <Card className="w-full p-8 bg-white/80 backdrop-blur border-0 shadow-lg mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              {isRecording ? (
                <>
                  <div className="w-3 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-16 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-3 h-8 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </>
              ) : isProcessing ? (
                <p className="text-gray-500 text-center">Processing your speech...</p>
              ) : (
                <p className="text-gray-400 text-center">Tap microphone to record</p>
              )}
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

          {/* Shadowing Results */}
          {shadowingResult && (
            <Card className="w-full p-6 mb-6 bg-white/80 backdrop-blur border-0 shadow-lg">
              {/* Accuracy Score */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {accuracy !== null && (
                  <div className={`text-center ${accuracy >= 90 ? 'text-green-600' : accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {accuracy >= 90 ? (
                <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <XCircle className="w-8 h-8" />
                      )}
                      <p className="text-4xl font-bold">{accuracy.toFixed(1)}%</p>
                    </div>
                    <p className="text-sm opacity-90">Accuracy Score</p>
                  </div>
                )}
              </div>

              {/* Transcribed Text with Highlighting */}
              {shadowingResult.transcribedText && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">You said:</p>
                  <div className="text-sm text-gray-800">
                    {shadowingResult.wordComparison && shadowingResult.wordComparison.length > 0 ? (
                      (() => {
                        // Split transcribed text into words while preserving spacing and punctuation
                        const transcribedWords = shadowingResult.transcribedText.split(/(\s+)/);
                        const wordMap = new Map<string, number>();
                        
                        // Create a map of transcribed words to their comparison index
                        shadowingResult.wordComparison.forEach((comp, idx) => {
                          if (comp.transcribedWord && comp.status !== '−') {
                            const word = comp.transcribedWord.toLowerCase();
                            if (!wordMap.has(word)) {
                              wordMap.set(word, idx);
                            }
                          }
                        });
                        
                        return transcribedWords.map((segment, segIdx) => {
                          // Check if this segment is a word (not just whitespace)
                          const trimmedSegment = segment.trim();
                          if (!trimmedSegment) {
                            // Preserve whitespace
                            return <span key={segIdx}>{segment}</span>;
                          }
                          
                          // Find matching comparison for this word
                          const wordLower = trimmedSegment.toLowerCase();
                          const compIdx = wordMap.get(wordLower);
                          
                          if (compIdx !== undefined) {
                            const comp = shadowingResult.wordComparison![compIdx];
                            const status = comp.status;
                            
                            // Determine highlighting based on status
                            let bgColor = '';
                            let textColor = '';
                            
                            if (status === '✗') {
                              // Wrong word - highlight in reddish-pink
                              bgColor = 'bg-red-300';
                              textColor = 'text-red-950';
                            } else if (status === '+') {
                              // Extra word - highlight in orange
                              bgColor = 'bg-orange-300';
                              textColor = 'text-orange-950';
                            } else {
                              // Correct word - no highlighting
                              bgColor = 'bg-transparent';
                              textColor = 'text-gray-800';
                            }
                            
                            return (
                              <span
                                key={segIdx}
                                className={`${bgColor} ${textColor} px-0.5 rounded transition-all`}
                              >
                                {segment}
                              </span>
                            );
                          }
                          
                          // Word not found in comparison - no highlighting
                          return <span key={segIdx}>{segment}</span>;
                        });
                      })()
                    ) : (
                      <span>{shadowingResult.transcribedText}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Visualizations */}
              {(waveformData.length > 0 || pitchData.length > 0 || isAnalyzingAudio) && (
                <div className="mb-4 space-y-4">
                  {/* Waveform Visualization */}
                  {isAnalyzingAudio ? (
                    <Card className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 text-center">Analyzing audio...</p>
                    </Card>
                  ) : (
                    <>
                      {waveformData.length > 0 && (
                        <Card className="p-4 bg-white/80 backdrop-blur border-0 shadow-lg">
                          <p className="text-xs text-gray-500 mb-3 font-semibold">Waveform</p>
                          <div className="flex items-end justify-center gap-0.5 h-24">
                            {waveformData.map((amplitude, idx) => {
                              // Normalize amplitude to 0-100% (find max and scale)
                              const maxAmplitude = Math.max(...waveformData);
                              const normalizedAmplitude = maxAmplitude > 0 ? (amplitude / maxAmplitude) * 100 : 0;
                              // Scale to make it more visible (multiply by 0.8 to leave some headroom, then add 5% minimum)
                              const height = Math.max(5, normalizedAmplitude * 0.8 + 5); // Minimum 5% height for visibility
                              return (
                                <div
                                  key={idx}
                                  className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-purple-500 transition-all"
                                  style={{ height: `${Math.min(100, height)}%`, minHeight: '3px' }}
                                />
                              );
                            })}
                          </div>
                        </Card>
                      )}

                      {/* Pitch Visualization */}
                      {pitchData.length > 0 && (
                        <Card className="p-4 bg-white/80 backdrop-blur border-0 shadow-lg">
                          <p className="text-xs text-gray-500 mb-3 font-semibold">Pitch (Hz)</p>
                          <div className="flex items-end justify-center gap-0.5 h-24">
                            {(() => {
                              // Filter out zero values and normalize pitch to 0-100%
                              // Find min and max pitch values (excluding zeros)
                              const validPitches = pitchData.filter(p => p > 0);
                              if (validPitches.length === 0) {
                                // Show flat line if no valid pitch data
                                return pitchData.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className="w-1 rounded-full bg-gray-300 transition-all"
                                    style={{ height: '3px', minHeight: '3px' }}
                                  />
                                ));
                              }
                              const minPitch = Math.min(...validPitches);
                              const maxPitch = Math.max(...validPitches);
                              const pitchRange = maxPitch - minPitch;
                              
                              return pitchData.map((pitch, idx) => {
                                // Normalize pitch to 0-100%
                                let normalizedPitch = 0;
                                if (pitch > 0 && pitchRange > 0) {
                                  normalizedPitch = ((pitch - minPitch) / pitchRange) * 100;
                                }
                                // Scale to make it more visible (multiply by 0.8 to leave some headroom, then add 5% minimum)
                                const height = Math.max(5, normalizedPitch * 0.8 + 5); // Minimum 5% height for visibility
                                return (
                                  <div
                                    key={idx}
                                    className="w-1 rounded-full bg-gradient-to-t from-yellow-400 to-orange-500 transition-all"
                                    style={{ height: `${Math.min(100, height)}%`, minHeight: '3px' }}
                                  />
                                );
                              });
                            })()}
                          </div>
                          <div className="mt-2 flex justify-between text-xs text-gray-400">
                            <span>80 Hz</span>
                            <span>~{(() => {
                              const validPitches = pitchData.filter(p => p > 0);
                              return validPitches.length > 0 
                                ? Math.round(validPitches.reduce((a, b) => a + b, 0) / validPitches.length)
                                : 0;
                            })()} Hz avg</span>
                            <span>400 Hz</span>
                          </div>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Sentence with Colored Highlights */}
              {shadowingResult.wordComparison && shadowingResult.wordComparison.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-3">Pronunciation feedback:</p>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex flex-wrap items-center gap-1 text-base leading-relaxed text-gray-900">
                      {shadowingResult.wordComparison.map((comp, wordIdx) => {
                        const status = comp.status;
                        const isClickable = status === '✗' || status === '−' || status === '+';
                        const isCorrect = status === '✓';
                        const word = comp.expectedWord || comp.transcribedWord || '';
                        
                        // Debug: Log status for each word
                        if (wordIdx === 0 || !isCorrect) {
                          console.log(`Rendering word ${wordIdx}: "${word}" with status: "${status}"`);
                        }
                        
                        // Get phoneme feedback for this word from the forced alignment response
                        let wordPhonemes: PhonemeData[] = [];
                        let wordData: WordData | undefined = undefined;
                        
                        if (sentencePhonemeFeedback && sentencePhonemeFeedback.words && sentencePhonemeFeedback.phonemes) {
                          // Find the word data that matches this word
                          // Match by comparing the word text (case-insensitive)
                          wordData = sentencePhonemeFeedback.words.find(w => 
                            w.word_orig?.toLowerCase() === word.toLowerCase() ||
                            w.word?.toLowerCase() === word.toLowerCase()
                          );
                          
                          if (wordData) {
                            // Get phonemes for this word using start_index and end_index
                            wordPhonemes = sentencePhonemeFeedback.phonemes.filter(p => 
                              p.start_index >= wordData!.start_index && 
                              p.end_index <= wordData!.end_index
                            );
                          }
                        }
                        
                        // Check if this word has any phoneme errors
                        const hasPhonemeErrors = wordPhonemes.some(p => 
                          p.score_type === 'error' || p.score_type === 'warning'
                        );
                        
                        // Debug logging
                        if (!isCorrect || hasPhonemeErrors) {
                          console.log(`Word ${wordIdx} (${word}):`, {
                            status,
                            isCorrect,
                            hasPhonemeErrors,
                            phonemeCount: wordPhonemes.length,
                            wordData: wordData ? { score_type: wordData.score_type, nativeness_score: wordData.nativeness_score } : null
                          });
                        }
                        
                        // If we have phoneme feedback with errors, split the word into segments
                        // Use phoneme-level highlighting if available, otherwise use whole-word highlighting
                        if (wordPhonemes.length > 0 && hasPhonemeErrors) {
                          // Create segments based on phoneme feedback
                          // Map phonemes to character positions in the word
                          const segments: Array<{ text: string; isIncorrect: boolean; isAlmost: boolean }> = [];
                          
                          // Sort phonemes by their position in the word
                          const sortedPhonemes = [...wordPhonemes].sort((a, b) => a.start_index - b.start_index);
                          
                          // Group consecutive phonemes with the same error type
                          const groupedPhonemes: Array<{
                            startIdx: number;
                            endIdx: number;
                            scoreType: 'error' | 'warning' | 'normal';
                          }> = [];
                          
                          if (sortedPhonemes.length > 0) {
                            let groupStart = sortedPhonemes[0].start_index;
                            let groupEnd = sortedPhonemes[0].end_index;
                            let groupScoreType = sortedPhonemes[0].score_type;
                            
                            for (let i = 1; i < sortedPhonemes.length; i++) {
                              const p = sortedPhonemes[i];
                              
                              // If same score type and consecutive, extend group
                              if (p.score_type === groupScoreType && p.start_index <= groupEnd + 1) {
                                groupEnd = Math.max(groupEnd, p.end_index);
                              } else {
                                // Save current group and start new one
                                groupedPhonemes.push({
                                  startIdx: groupStart,
                                  endIdx: groupEnd,
                                  scoreType: groupScoreType
                                });
                                groupStart = p.start_index;
                                groupEnd = p.end_index;
                                groupScoreType = p.score_type;
                              }
                            }
                            
                            // Add last group
                            groupedPhonemes.push({
                              startIdx: groupStart,
                              endIdx: groupEnd,
                              scoreType: groupScoreType
                            });
                          }
                          
                          // Map phoneme indices to character positions
                          // Use the word's IPA transcription length as a guide
                          const wordText = wordData?.word_orig || word;
                          const totalPhonemes = sortedPhonemes.length;
                          let currentPos = 0;
                          
                          // Simple mapping: distribute characters evenly across phonemes
                          // This is approximate but should work for most cases
                          for (const group of groupedPhonemes) {
                            // Calculate character range for this phoneme group
                            const phonemeStartIdx = group.startIdx - (wordData?.start_index || 0);
                            const phonemeEndIdx = group.endIdx - (wordData?.start_index || 0);
                            
                            const startChar = Math.max(0, Math.floor((phonemeStartIdx / totalPhonemes) * wordText.length));
                            const endChar = Math.min(
                              Math.ceil(((phonemeEndIdx + 1) / totalPhonemes) * wordText.length),
                              wordText.length
                            );
                            
                            // Add normal segment before this group if needed
                            if (currentPos < startChar) {
                              segments.push({
                                text: wordText.substring(currentPos, startChar),
                                isIncorrect: false,
                                isAlmost: false
                              });
                            }
                            
                            // Add highlighted segment
                            if (startChar < endChar) {
                              segments.push({
                                text: wordText.substring(startChar, endChar),
                                isIncorrect: group.scoreType === 'error',
                                isAlmost: group.scoreType === 'warning'
                              });
                            }
                            
                            currentPos = endChar;
                          }
                          
                          // Add remaining normal segment
                          if (currentPos < wordText.length) {
                            segments.push({
                              text: wordText.substring(currentPos),
                              isIncorrect: false,
                              isAlmost: false
                            });
                          }
                          
                          return (
                            <span
                              key={wordIdx}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isClickable) {
                                  handleOpenPractice(comp);
                                }
                              }}
                              className={`${isClickable ? 'cursor-pointer hover:opacity-80 active:opacity-70' : ''} transition-all`}
                              title={
                                isCorrect
                                  ? 'Correct'
                                  : status === '✗'
                                  ? `Click to practice: Expected "${comp.expectedWord}", You said "${comp.transcribedWord}"`
                                  : status === '−'
                                  ? `Click to practice: Missing "${comp.expectedWord}"`
                                  : `Click to practice: Extra word "${comp.transcribedWord}"`
                              }
                            >
                              {segments.map((segment, segIdx) => {
                                let bgColor = '';
                                let textColor = '';
                                if (segment.isIncorrect) {
                                  // Reddish-pink for incorrect phonemes
                                  bgColor = 'bg-red-300';
                                  textColor = 'text-red-950';
                                } else if (segment.isAlmost) {
                                  // Orange for almost-correct phonemes
                                  bgColor = 'bg-orange-300';
                                  textColor = 'text-orange-950';
                                } else {
                                  // Normal text for correct parts
                                  bgColor = 'bg-transparent';
                                  textColor = 'text-gray-900';
                                }
                                
                                return (
                                  <span
                                    key={segIdx}
                                    className={`${bgColor} ${textColor} px-0.5 rounded transition-all`}
                                  >
                                    {segment.text}
                                  </span>
                                );
                              })}
                            </span>
                          );
                        }
                        
                        // Fallback to whole word highlighting if no phoneme feedback
                        // ALWAYS highlight wrong words, even without phoneme feedback
                        let bgColor = '';
                        let textColor = '';
                        
                        // Determine highlighting based on status
                        // IMPORTANT: Always highlight wrong words, even without phoneme feedback
                        // Check status first (this is the primary indicator)
                        if (status === '✗') {
                          // Wrong word - highlight entire word in reddish-pink
                          bgColor = 'bg-red-300';
                          textColor = 'text-red-950';
                        } else if (status === '−') {
                          // Missing word - highlight in yellow
                          bgColor = 'bg-yellow-300';
                          textColor = 'text-yellow-950';
                        } else if (status === '+') {
                          // Extra word - highlight in orange
                          bgColor = 'bg-orange-300';
                          textColor = 'text-orange-950';
                        } else if (hasPhonemeErrors) {
                          // Word is correct at word level but has phoneme errors - highlight in orange
                          bgColor = 'bg-orange-300';
                          textColor = 'text-orange-950';
                        } else if (isCorrect) {
                          // Completely correct word - no highlighting
                          bgColor = '';
                          textColor = 'text-gray-900';
                        } else {
                          // Default - no highlighting (shouldn't reach here)
                          bgColor = '';
                          textColor = 'text-gray-900';
                        }
                        
                        // Debug: Log highlighting decision for wrong words
                        if (bgColor || !isCorrect) {
                          console.log(`Word "${word}" (idx ${wordIdx}): status="${status}", isCorrect=${isCorrect}, bgColor="${bgColor}"`);
                        }
                        
                        // Always render the word, with or without highlighting
                        // Build className string
                        const classNameParts = [
                          bgColor, // Background color (e.g., 'bg-red-300')
                          textColor, // Text color (e.g., 'text-red-950')
                          isClickable ? 'cursor-pointer hover:opacity-80 active:opacity-70' : '',
                          bgColor ? 'px-1 rounded' : '', // Padding and rounded corners if highlighted
                          'transition-all',
                          'inline-block'
                        ].filter(Boolean); // Remove empty strings
                        
                        const finalClassName = classNameParts.join(' ');
                        
                        return (
                          <span
                            key={wordIdx}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isClickable) {
                                handleOpenPractice(comp);
                              }
                            }}
                            className={finalClassName}
                            title={
                              isCorrect && !hasPhonemeErrors
                                ? 'Correct'
                                : status === '✗'
                                ? `Click to practice: Expected "${comp.expectedWord}", You said "${comp.transcribedWord}"`
                                : status === '−'
                                ? `Click to practice: Missing "${comp.expectedWord}"`
                                : status === '+'
                                ? `Click to practice: Extra word "${comp.transcribedWord}"`
                                : 'Has pronunciation errors'
                            }
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Feedback */}
              {shadowingResult.feedback && (
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-600 whitespace-pre-line">{shadowingResult.feedback}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-gray-500">Correct</p>
                  <p className="text-green-600 font-bold">{shadowingResult.totalCorrect}/{shadowingResult.totalExpected}</p>
                </div>
                <div>
                  <p className="text-gray-500">Wrong</p>
                  <p className="text-red-600 font-bold">{shadowingResult.wrongWords?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Missing</p>
                  <p className="text-yellow-600 font-bold">{shadowingResult.missingWords?.length || 0}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {/* Main Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleRecord}
                disabled={isProcessing}
              className={`py-6 ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
              }`}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
                onClick={handlePlayRecorded}
                disabled={!recordedAudioBlob || isPlaying || isProcessing || isRecording}
                className="py-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                title={recordedAudioBlob ? "Play your recording" : "Record first to play back"}
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleNext}
                disabled={isRecording || isProcessing}
                className="py-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                title={currentIndex === words.length - 1 ? "Finish challenge" : "Next word"}
              >
                {currentIndex === words.length - 1 ? (
                  <Trophy className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            {/* Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0 || isRecording || isProcessing}
                className="py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50"
                title="Previous word"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={isRecording || isProcessing}
                className="py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                title={currentIndex === words.length - 1 ? "Finish challenge" : "Next word"}
              >
                {currentIndex === words.length - 1 ? (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Modal */}
      <Dialog open={isPracticeModalOpen} onOpenChange={(open: boolean) => {
        if (!open) {
          handleClosePractice();
        } else {
          setIsPracticeModalOpen(true);
        }
      }}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Practice Word
            </DialogTitle>
            <DialogDescription>
              Practice pronouncing this word correctly
            </DialogDescription>
          </DialogHeader>

          {practiceWord && (() => {
            // Try to find the word in the words list to get pronunciation
            const wordToPractice = practiceWord.expectedWord || practiceWord.transcribedWord || '';
            const foundWord = words.find(w => 
              w.englishWord.toLowerCase() === wordToPractice.toLowerCase()
            );
            
            return (
              <div className="space-y-6">
                {/* Word Display */}
                <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {wordToPractice}
                    </h3>
                    {foundWord?.pronunciation && (
                      <p className="text-lg text-gray-600 mb-2">
                        {foundWord.pronunciation}
                      </p>
                    )}
                    {practiceWord.status === '✗' && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Expected: <span className="font-semibold text-green-600">{practiceWord.expectedWord}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          You said: <span className="font-semibold text-red-600">{practiceWord.transcribedWord}</span>
                        </p>
                      </div>
                    )}
                    {practiceWord.status === '−' && (
                      <p className="text-sm text-yellow-600 mt-2">
                        Missing word: <span className="font-semibold">{practiceWord.expectedWord}</span>
                      </p>
                    )}
                    {practiceWord.status === '+' && (
                      <p className="text-sm text-blue-600 mt-2">
                        Extra word: <span className="font-semibold">{practiceWord.transcribedWord}</span>
                      </p>
                    )}
                  </div>

                {/* Play Original Button */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handlePlayPracticeOriginal}
                    disabled={isPlayingPractice}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg disabled:opacity-50"
                  >
                    <Volume2 className="w-6 h-6 text-white" />
                  </button>
                  <p className="text-gray-600">Listen to correct pronunciation</p>
                </div>
              </Card>

              {/* Recording Area */}
              <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {isPracticeRecording ? (
                    <>
                      <div className="w-3 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-16 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-3 h-8 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </>
                  ) : isPracticeProcessing ? (
                    <p className="text-gray-500 text-center">Processing your speech...</p>
                  ) : (
                    <p className="text-gray-400 text-center">Tap microphone to record</p>
                  )}
                </div>
              </Card>

              {/* Phoneme-Level Feedback */}
              {(phonemeFeedback?.phonemes && phonemeFeedback.phonemes.length > 0 || isLoadingPhonemeFeedback) && (
                <Card className="p-4 bg-white/80 backdrop-blur border-0 shadow-lg">
                  {isLoadingPhonemeFeedback ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Loading detailed feedback...</p>
                    </div>
                  ) : phonemeFeedback ? (
                    <>
                      {/* Progress Bar */}
                      {(() => {
                        const phonemes = phonemeFeedback.phonemes || [];
                        const correctCount = phonemes.filter(p => p.score_type === 'normal').length;
                        const totalCount = phonemes.length;
                        const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
                        return (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Pronunciation Score</span>
                              <span className="text-sm font-bold text-gray-800">{Math.round(accuracy)}%</span>
                            </div>
                            <Progress 
                              value={accuracy} 
                              className={`h-3 ${
                                accuracy >= 90 ? 'bg-green-200' : accuracy >= 70 ? 'bg-yellow-200' : 'bg-red-200'
                              }`}
                            />
                          </div>
                        );
                      })()}

                      {/* Phoneme Details */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Sound-by-sound feedback:</p>
                        {phonemeFeedback.phonemes.map((phoneme, idx) => {
                          const isCorrect = phoneme.score_type === 'normal';
                          const isWarning = phoneme.score_type === 'warning';
                          
                          return (
                            <div 
                              key={idx} 
                              className={`p-3 rounded-lg border ${
                                isCorrect 
                                  ? 'bg-green-50 border-green-200' 
                                  : isWarning 
                                  ? 'bg-yellow-50 border-yellow-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                  {phoneme.text} ({phoneme.trans_arpabet})
                                </span>
                                <span className={`text-xs font-semibold ${
                                  isCorrect 
                                    ? 'text-green-600' 
                                    : isWarning 
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}>
                                  {isCorrect ? 'Correct' : isWarning ? 'Warning' : 'Error'}
                                </span>
                              </div>
                              {phoneme.error_type && phoneme.error_type !== 'normal' && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Error: {phoneme.error_type_arpabet || phoneme.error_type}
                                </p>
                              )}
                              {phoneme.feedback && phoneme.feedback.length > 0 && (
                                <p className="text-xs text-gray-600 mt-2">
                                  {phoneme.feedback[0].text}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </Card>
              )}

              {/* Practice Results */}
              {practiceResult && (!phonemeFeedback?.phonemes || phonemeFeedback.phonemes.length === 0) && (
                <Card className="p-4 bg-white/80 backdrop-blur border-0 shadow-lg">
                  <div className="text-center mb-3">
                    {practiceResult.accuracy !== null && (
                      <div className={`text-center ${practiceResult.accuracy >= 90 ? 'text-green-600' : practiceResult.accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {practiceResult.accuracy >= 90 ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <XCircle className="w-6 h-6" />
                          )}
                          <p className="text-3xl font-bold">{practiceResult.accuracy.toFixed(1)}%</p>
                        </div>
                        <p className="text-xs opacity-90">Accuracy</p>
                      </div>
                    )}
                  </div>
                  
                  {practiceResult.transcribedText && (
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">You said:</p>
                      <p className="text-sm text-gray-800">{practiceResult.transcribedText}</p>
                    </div>
                  )}

                  {practiceResult.feedback && (
                    <div className="p-2 bg-indigo-50 rounded">
                      <p className="text-xs text-gray-600 whitespace-pre-line">{practiceResult.feedback}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={handlePracticeRecord}
                  disabled={isPracticeProcessing}
                  className={`py-4 ${
                    isPracticeRecording
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handlePlayPracticeRecorded}
                  disabled={!practiceRecordedBlob || isPlayingPractice || isPracticeProcessing || isPracticeRecording}
                  className="py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                  title={practiceRecordedBlob ? "Play your recording" : "Record first to play back"}
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleClosePractice}
                  className="py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
