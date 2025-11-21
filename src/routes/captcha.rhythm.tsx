import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { CaptchaContainer } from '../components/CaptchaContainer';
import { Button } from '../components/Button';
import { ResultScreen } from '../components/ResultScreen';
import { useApp } from '../contexts/AppContext';

export const Route = createFileRoute('/captcha/rhythm')({
  component: RhythmCaptcha,
});

interface Note {
  time: number;
  key: string;
  lane: number;
}

const KEYS = ['a', 's', 'd', 'f'];
const NOTE_SPEED = 2; // seconds to fall
const PASS_THRESHOLD = 0.7;
const TIMING_WINDOW = 0.15; // seconds

function RhythmCaptcha() {
  const navigate = useNavigate();
  const { markCaptchaComplete, incrementAttempts } = useApp();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState({ hits: 0, misses: 0 });
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  
  const synthsRef = useRef<Tone.Synth[]>([]);
  const transportStartRef = useRef<number>(0);
  const notesProcessedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Initialize synths
    synthsRef.current = KEYS.map(() => new Tone.Synth().toDestination());

    // Create note pattern
    const pattern: Note[] = [];
    const measures = 4;
    const beatsPerMeasure = 4;
    const totalBeats = measures * beatsPerMeasure;

    for (let beat = 0; beat < totalBeats; beat++) {
      const lane = Math.floor(Math.random() * 4);
      pattern.push({
        time: beat * 0.5, // Half note intervals
        key: KEYS[lane],
        lane,
      });
    }

    setNotes(pattern);

    return () => {
      synthsRef.current.forEach(synth => synth.dispose());
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      setCurrentTime(Tone.Transport.seconds - transportStartRef.current);
    }, 50);

    return () => clearInterval(intervalId);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const key = e.key.toLowerCase();
      if (!KEYS.includes(key) || pressedKeys.has(key)) return;

      setPressedKeys(prev => new Set(prev).add(key));

      // Check for hit
      const currentGameTime = Tone.Transport.seconds - transportStartRef.current;
      const lane = KEYS.indexOf(key);
      
      let hitDetected = false;
      notes.forEach((note, index) => {
        if (note.lane === lane && !notesProcessedRef.current.has(index)) {
          const notePosition = note.time;
          const timeDiff = Math.abs(currentGameTime - notePosition);
          
          if (timeDiff < TIMING_WINDOW) {
            notesProcessedRef.current.add(index);
            setScore(prev => ({ ...prev, hits: prev.hits + 1 }));
            hitDetected = true;
            synthsRef.current[lane].triggerAttackRelease('C4', '8n');
          }
        }
      });

      if (!hitDetected) {
        setScore(prev => ({ ...prev, misses: prev.misses + 1 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYS.includes(key)) {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, notes]);

  const startGame = async () => {
    await Tone.start();
    setIsPlaying(true);
    setScore({ hits: 0, misses: 0 });
    notesProcessedRef.current.clear();
    
    transportStartRef.current = Tone.Transport.seconds;
    
    // Schedule notes to play as audio cues
    notes.forEach(note => {
      Tone.Transport.schedule(() => {
        synthsRef.current[note.lane].triggerAttackRelease('C4', '16n');
      }, `+${note.time}`);
    });

    Tone.Transport.start();

    // End game after all notes have passed
    const gameDuration = (notes[notes.length - 1].time + NOTE_SPEED) * 1000;
    setTimeout(() => {
      endGame();
    }, gameDuration);
  };

  const endGame = () => {
    setIsPlaying(false);
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    const totalNotes = notes.length;
    const accuracy = score.hits / totalNotes;
    const didPass = accuracy >= PASS_THRESHOLD;
    
    setPassed(didPass);
    setShowResult(true);
    
    if (didPass) {
      markCaptchaComplete('rhythm', true, accuracy);
    } else {
      incrementAttempts('rhythm');
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setScore({ hits: 0, misses: 0 });
    setCurrentTime(0);
    notesProcessedRef.current.clear();
  };

  const handleContinue = () => {
    navigate({ to: '/captcha/counter' });
  };

  const getVisibleNotes = () => {
    return notes.filter(note => {
      const notePosition = (currentTime - note.time) / NOTE_SPEED;
      return notePosition >= -0.1 && notePosition <= 1;
    });
  };

  return (
    <CaptchaContainer
      title="RHYTHM VERIFICATION"
      description="Press the corresponding keys (A, S, D, F) when the notes reach the target line. Achieve 70% accuracy to pass."
    >
      <div className="space-y-6">
        {!isPlaying ? (
          <div className="text-center py-12">
            <div className="mb-8">
              <p className="text-muted mb-4">
                This test verifies human rhythm perception and motor coordination.
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {KEYS.map(key => (
                  <div key={key} className="px-6 py-3 bg-border rounded text-accent font-bold text-xl uppercase">
                    {key}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={startGame}>Start Test</Button>
          </div>
        ) : (
          <>
            <div className="bg-border/20 rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Hits: <span className="text-accent">{score.hits}</span></span>
                <span className="text-muted">Misses: <span className="text-red-500">{score.misses}</span></span>
              </div>
            </div>

            <div className="relative h-96 bg-border/10 rounded-lg overflow-hidden">
              {/* Target line */}
              <div className="absolute bottom-16 left-0 right-0 h-1 bg-accent z-10" />

              {/* Lanes */}
              <div className="absolute inset-0 flex">
                {KEYS.map((key) => (
                  <div
                    key={key}
                    className={`flex-1 border-r border-border last:border-r-0 relative transition-colors ${
                      pressedKeys.has(key) ? 'bg-accent/20' : ''
                    }`}
                  >
                    {/* Key label at bottom */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <div className={`inline-block px-4 py-2 rounded font-bold text-lg uppercase transition-transform ${
                        pressedKeys.has(key) ? 'bg-accent text-background scale-110' : 'bg-border text-accent'
                      }`}>
                        {key}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Falling notes */}
              {getVisibleNotes().map((note) => {
                const progress = (currentTime - note.time) / NOTE_SPEED;
                const top = progress * 100;
                const noteIndex = notes.indexOf(note);
                const processed = notesProcessedRef.current.has(noteIndex);
                
                return (
                  <div
                    key={noteIndex}
                    className={`absolute w-1/4 transition-opacity ${
                      processed ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{
                      left: `${note.lane * 25}%`,
                      top: `${top}%`,
                    }}
                  >
                    <div className="mx-2 h-12 bg-accent rounded shadow-lg" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showResult && (
        <ResultScreen
          passed={passed}
          onRetry={handleRetry}
          onContinue={handleContinue}
          message={
            passed
              ? `Accuracy: ${Math.round((score.hits / notes.length) * 100)}%`
              : `Insufficient accuracy: ${Math.round((score.hits / notes.length) * 100)}%. Required: 70%`
          }
        />
      )}
    </CaptchaContainer>
  );
}

