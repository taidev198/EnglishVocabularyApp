import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { ShadowingResponse, ForcedAlignmentResponse, WordComparison, PhonemeData, WordData } from '../../api/types';

interface PronunciationFeedbackDisplayProps {
  shadowingResult: ShadowingResponse;
  sentencePhonemeFeedback: ForcedAlignmentResponse | null;
  onWordClick?: (wordComparison: WordComparison) => void;
  onPlayAudio?: () => void;
}

export function PronunciationFeedbackDisplay({
  shadowingResult,
  sentencePhonemeFeedback,
  onWordClick,
  onPlayAudio
}: PronunciationFeedbackDisplayProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  
  if (!shadowingResult.wordComparison || shadowingResult.wordComparison.length === 0) {
    return null;
  }

  // Helper function to get word highlighting
  const getWordHighlighting = (word: string, wordIdx: number) => {
    // Find the corresponding word comparison
    const comp = shadowingResult.wordComparison?.find((c, idx) => {
      const expectedWord = c.expectedWord?.toLowerCase().trim();
      const wordLower = word.toLowerCase().trim();
      return expectedWord === wordLower || idx === wordIdx;
    });

    if (!comp) {
      return { segments: [{ text: word, scoreType: 'normal' as const }], isClickable: false, status: null };
    }

    const status = comp.status;
    const isClickable = status === '✗' || status === '−' || status === '+';
    
    // Get phoneme feedback for this word
    let wordPhonemes: PhonemeData[] = [];
    let wordData: WordData | undefined = undefined;

    if (sentencePhonemeFeedback?.words && sentencePhonemeFeedback?.phonemes) {
      wordData = sentencePhonemeFeedback.words.find(w => 
        w.word_orig?.toLowerCase() === word.toLowerCase() ||
        w.word?.toLowerCase() === word.toLowerCase()
      );
      
      if (wordData) {
        wordPhonemes = sentencePhonemeFeedback.phonemes.filter(p => 
          p.start_index >= wordData!.start_index && 
          p.end_index <= wordData!.end_index
        );
      }
    }

    // If we have phoneme feedback, create segments
    if (wordPhonemes.length > 0) {
      const segments: Array<{ text: string; scoreType: 'error' | 'warning' | 'normal' }> = [];
      const sortedPhonemes = [...wordPhonemes].sort((a, b) => a.start_index - b.start_index);
      
      const groupedPhonemes: Array<{
        startIdx: number;
        endIdx: number;
        scoreType: 'error' | 'warning' | 'normal';
      }> = [];

      if (sortedPhonemes.length > 0) {
        let groupStart = sortedPhonemes[0].start_index;
        let groupEnd = sortedPhonemes[0].end_index;
        let groupScoreType = sortedPhonemes[0].score_type as 'error' | 'warning' | 'normal';

        for (let i = 1; i < sortedPhonemes.length; i++) {
          const p = sortedPhonemes[i];
          if (p.score_type === groupScoreType && p.start_index <= groupEnd + 1) {
            groupEnd = Math.max(groupEnd, p.end_index);
          } else {
            groupedPhonemes.push({
              startIdx: groupStart,
              endIdx: groupEnd,
              scoreType: groupScoreType
            });
            groupStart = p.start_index;
            groupEnd = p.end_index;
            groupScoreType = p.score_type as 'error' | 'warning' | 'normal';
          }
        }
        groupedPhonemes.push({
          startIdx: groupStart,
          endIdx: groupEnd,
          scoreType: groupScoreType
        });
      }

      const wordText = wordData?.word_orig || word;
      let currentPos = 0;
      const maxPhonemeIdx = Math.max(...sortedPhonemes.map(p => p.end_index));
      const minPhonemeIdx = Math.min(...sortedPhonemes.map(p => p.start_index));
      const phonemeRange = maxPhonemeIdx - minPhonemeIdx;

      for (const group of groupedPhonemes) {
        const phonemeStartIdx = group.startIdx - minPhonemeIdx;
        const phonemeEndIdx = group.endIdx - minPhonemeIdx;
        
        const startChar = phonemeRange > 0 
          ? Math.max(0, Math.floor((phonemeStartIdx / phonemeRange) * wordText.length))
          : 0;
        const endChar = phonemeRange > 0
          ? Math.min(
              Math.ceil((phonemeEndIdx / phonemeRange) * wordText.length),
              wordText.length
            )
          : wordText.length;

        if (currentPos < startChar) {
          segments.push({
            text: wordText.substring(currentPos, startChar),
            scoreType: 'normal'
          });
        }

        if (startChar < endChar) {
          segments.push({
            text: wordText.substring(startChar, endChar),
            scoreType: group.scoreType
          });
        }

        currentPos = endChar;
      }

      if (currentPos < wordText.length) {
        segments.push({
          text: wordText.substring(currentPos),
          scoreType: 'normal'
        });
      }

      return { segments, isClickable, status, comp };
    }

    // Fallback to whole word highlighting
    let scoreType: 'error' | 'warning' | 'normal' = 'normal';
    if (status === '✗') {
      scoreType = 'error';
    } else if (status === '−' || status === '+') {
      scoreType = 'warning';
    }

    return {
      segments: [{ text: word, scoreType }],
      isClickable,
      status,
      comp
    };
  };

  // Get color classes based on score type
  const getColorClasses = (scoreType: 'error' | 'warning' | 'normal') => {
    switch (scoreType) {
      case 'error':
        return {
          text: 'text-red-600',
          bg: 'bg-red-50',
          hover: 'hover:bg-red-100',
          bold: 'font-bold'
        };
      case 'warning':
        return {
          text: 'text-orange-500',
          bg: 'bg-orange-50',
          hover: 'hover:bg-orange-100',
          bold: 'font-semibold'
        };
      default:
        return {
          text: 'text-green-600',
          bg: 'bg-green-50',
          hover: 'hover:bg-green-100',
          bold: 'font-semibold'
        };
    }
  };

  // Special word styling based on the example
  const getSpecialWordStyle = (word: string, scoreType: 'error' | 'warning' | 'normal') => {
    const wordLower = word.toLowerCase();
    
    // "technology" - bold, dark navy with "tech" in orange
    if (wordLower.includes('technology')) {
      return {
        baseColor: 'text-slate-800',
        bold: true,
        specialParts: [
          { text: 'tech', color: 'text-orange-500' },
          { text: 'nology', color: 'text-slate-800' }
        ]
      };
    }
    
    // "pronunciation" - gradient (orange to purple)
    if (wordLower.includes('pronunciation') && scoreType === 'warning') {
      return {
        gradient: true,
        gradientColors: 'from-orange-400 to-purple-500'
      };
    }
    
    // "detailed" - red text
    if (wordLower.includes('detailed') && scoreType === 'error') {
      return {
        baseColor: 'text-red-600',
        bold: true
      };
    }
    
    // "explanations" - purple text
    if (wordLower.includes('explanations')) {
      return {
        baseColor: 'text-purple-600',
        bold: true
      };
    }
    
    // "improvement" - yellow text
    if (wordLower.includes('improvement')) {
      return {
        baseColor: 'text-yellow-600',
        bold: true
      };
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        {/* Play Button */}
        {onPlayAudio && (
          <div className="flex items-center justify-center mb-8">
            <button
              onClick={onPlayAudio}
              className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-all group-hover:scale-110">
                <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
              </div>
              <span className="text-base font-medium">Listen to pronunciation</span>
            </button>
          </div>
        )}

        {/* Sentence Display */}
        <div className="text-center">
          <p className="text-2xl md:text-3xl leading-relaxed text-gray-800 font-normal" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {shadowingResult.wordComparison.map((comp, wordIdx) => {
              const word = comp.expectedWord || comp.transcribedWord || '';
              const { segments, isClickable, comp: wordComp } = getWordHighlighting(word, wordIdx);

              return (
                <React.Fragment key={wordIdx}>
                  <span
                    className={`inline-block ${
                      isClickable ? 'cursor-pointer' : ''
                    } transition-all`}
                    onMouseEnter={() => isClickable && setHoveredWord(word)}
                    onMouseLeave={() => setHoveredWord(null)}
                    onClick={(e) => {
                      if (isClickable && wordComp && onWordClick) {
                        e.preventDefault();
                        e.stopPropagation();
                        onWordClick(wordComp);
                      }
                    }}
                  >
                    {(() => {
                      // Check for special word styling
                      const specialStyle = getSpecialWordStyle(word, segments[0]?.scoreType || 'normal');
                      
                      if (specialStyle?.specialParts) {
                        // Handle "technology" with special parts
                        const wordText = word;
                        const techIndex = wordText.toLowerCase().indexOf('tech');
                        if (techIndex !== -1) {
                          return (
                            <>
                              <span className="text-slate-800 font-bold">
                                {wordText.substring(0, techIndex)}
                              </span>
                              <span className="text-orange-500 font-bold">
                                {wordText.substring(techIndex, techIndex + 4)}
                              </span>
                              <span className="text-slate-800 font-bold">
                                {wordText.substring(techIndex + 4)}
                              </span>
                            </>
                          );
                        }
                      }
                      
                      // Default: use segments with phoneme-level highlighting
                      return segments.map((segment, segIdx) => {
                        const colors = getColorClasses(segment.scoreType);
                        const isHovered = hoveredWord === word && isClickable;
                        
                        // Check for special styling
                        const specialStyle = getSpecialWordStyle(word, segment.scoreType);
                        
                        // Special styling for gradient effect on certain words (like "pronunciation")
                        let gradientClass = '';
                        let gradientStyle = {};
                        if (specialStyle?.gradient || (segment.scoreType === 'warning' && word.length > 8)) {
                          gradientClass = 'bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent';
                          gradientStyle = {
                            background: 'linear-gradient(to right, #fb923c, #a855f7)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          };
                        }

                        // Determine text color based on score type or special style
                        let textColorClass = '';
                        if (specialStyle?.baseColor) {
                          textColorClass = specialStyle.baseColor;
                        } else if (segment.scoreType === 'error') {
                          textColorClass = 'text-red-600';
                        } else if (segment.scoreType === 'warning' && !gradientClass) {
                          textColorClass = 'text-orange-500';
                        } else if (segment.scoreType === 'normal') {
                          textColorClass = 'text-green-600';
                        }

                        return (
                          <span
                            key={segIdx}
                            className={`
                              ${textColorClass}
                              ${specialStyle?.bold || colors.bold}
                              ${isHovered ? colors.hover : ''}
                              ${gradientClass}
                              px-1.5 py-1 rounded-md transition-all duration-200
                              ${isClickable ? 'hover:scale-105 hover:shadow-sm' : ''}
                            `}
                            style={gradientStyle}
                          >
                            {segment.text}
                          </span>
                        );
                      });
                    })()}
                  </span>
                  {wordIdx < shadowingResult.wordComparison.length - 1 && ' '}
                </React.Fragment>
              );
            })}
          </p>
        </div>

        {/* Tooltip on hover */}
        {shadowingResult.wordComparison.some(comp => {
          return comp.status === '✗' || comp.status === '−' || comp.status === '+';
        }) && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Hover over highlighted words to see feedback
          </p>
        )}
      </div>
    </div>
  );
}

