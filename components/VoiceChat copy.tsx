// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from "lucide-react";
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// export default function VoiceChat() {
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isAiSpeaking, setIsAiSpeaking] = useState(false);
//   const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([]);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const conversationRef = useRef<Array<{ role: 'user' | 'assistant', content: string }>>([]);
//   const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const lastTranscriptRef = useRef<string>("");

//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition
//   } = useSpeechRecognition();

//   // Auto-start listening when call is active and AI is not speaking
//   useEffect(() => {
//     if (isCallActive && !isAiSpeaking && !listening) {
//       SpeechRecognition.startListening({ continuous: true });
//     }
//   }, [isCallActive, isAiSpeaking, listening]);

//   // Detect when user stops talking and send message after 3 seconds of silence
//   useEffect(() => {
//     if (!isCallActive || isAiSpeaking) {
//       // Clear timer if call is inactive or AI is speaking
//       if (silenceTimerRef.current) {
//         clearTimeout(silenceTimerRef.current);
//         silenceTimerRef.current = null;
//       }
//       return;
//     }

//     // If transcript changed (user is speaking), clear existing timer
//     if (transcript !== lastTranscriptRef.current) {
//       lastTranscriptRef.current = transcript;
      
//       if (silenceTimerRef.current) {
//         clearTimeout(silenceTimerRef.current);
//       }

//       // Start new timer for 3 seconds of silence
//       if (transcript.trim()) {
//         silenceTimerRef.current = setTimeout(() => {
//           console.log("3 seconds of silence detected, sending message:", transcript);
//           handleSendMessage(transcript);
//           resetTranscript();
//           lastTranscriptRef.current = "";
//         }, 3000); // Wait 3 seconds after user stops talking
//       }
//     }

//     return () => {
//       if (silenceTimerRef.current) {
//         clearTimeout(silenceTimerRef.current);
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [transcript, isCallActive, isAiSpeaking]);

//   const startCall = () => {
//     setIsCallActive(true);
//     setConversation([]);
//     conversationRef.current = [];
//     SpeechRecognition.startListening({ continuous: true });
//   };

//   const endCall = () => {
//     setIsCallActive(false);
//     SpeechRecognition.stopListening();
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.src = "";
//     }
//     setIsAiSpeaking(false);
//   };

//   const handleSendMessage = async (text: string) => {
//     if (!text.trim()) return;

//     console.log("📤 Sending message to AI:", text);

//     // Clear any pending silence timer
//     if (silenceTimerRef.current) {
//       clearTimeout(silenceTimerRef.current);
//       silenceTimerRef.current = null;
//     }

//     // Add user message to conversation
//     const userMessage = { role: 'user' as const, text };
//     setConversation(prev => [...prev, userMessage]);
//     conversationRef.current.push({ role: 'user', content: text });

//     // Stop listening while AI responds
//     console.log("🎤 Stopping microphone...");
//     SpeechRecognition.stopListening();
//     setIsAiSpeaking(true);

//     try {
//       // Send to AI - Note: API expects messages without the new message, and newMessage separately
//       const response = await fetch('/api/chat/stream', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           messages: conversationRef.current.slice(0, -1), // Exclude the user message we just added
//           newMessage: text,
//           chatId: 'voice-chat-' + Date.now(),
//         }),
//       });

//       if (!response.ok) throw new Error('AI response failed');

//       // Parse streaming response
//       const reader = response.body?.getReader();
//       let aiResponse = '';

//       if (reader) {
//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) break;

//           const chunk = new TextDecoder().decode(value);
//           const lines = chunk.split('\n');
          
//           for (const line of lines) {
//             if (line.startsWith('data: ')) {
//               try {
//                 const data = JSON.parse(line.slice(6));
//                 if (data.type === 'token' && data.token) {
//                   aiResponse += data.token;
//                 }
//               } catch (e) {
//                 // Skip invalid JSON
//               }
//             }
//           }
//         }
//       }

//       // Add AI response to conversation
//       const aiMessage = { role: 'assistant' as const, text: aiResponse };
//       setConversation(prev => [...prev, aiMessage]);
//       conversationRef.current.push({ role: 'assistant', content: aiResponse });

//       // Speak the AI response
//       await speakText(aiResponse);

//     } catch (error) {
//       console.error('Voice chat error:', error);
//       setIsAiSpeaking(false);
//     }
//   };

//   const speakText = async (text: string) => {
//     if (!text) {
//       setIsAiSpeaking(false);
//       return;
//     }

//     // Clean text for TTS
//     const cleanText = text
//       .replace(/---START---[\s\S]*?---END---/g, "")
//       .replace(/#{1,6}\s/g, "")
//       .replace(/\*\*/g, "")
//       .replace(/\*/g, "")
//       .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
//       .replace(/<[^>]+>/g, "")
//       .replace(/`/g, "")
//       .trim();

//     if (!cleanText) {
//       setIsAiSpeaking(false);
//       return;
//     }

//     try {
//       const response = await fetch("/api/tts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: cleanText }),
//       });

//       if (!response.ok) {
//         setIsAiSpeaking(false);
//         return;
//       }

//       const audioBlob = await response.blob();
//       const audioUrl = URL.createObjectURL(audioBlob);

//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.src = "";
//       }

//       const audio = new Audio(audioUrl);
//       audioRef.current = audio;

//       audio.onended = () => {
//         console.log("🔊 AI finished speaking, turning mic back on...");
//         setIsAiSpeaking(false);
//         URL.revokeObjectURL(audioUrl);
//         // Resume listening after AI finishes speaking
//         if (isCallActive) {
//           SpeechRecognition.startListening({ continuous: true });
//         }
//       };

//       audio.onerror = () => {
//         console.error("Audio playback error");
//         setIsAiSpeaking(false);
//         URL.revokeObjectURL(audioUrl);
//         if (isCallActive) {
//           SpeechRecognition.startListening({ continuous: true });
//         }
//       };

//       console.log("🔊 Playing AI response...");
//       await audio.play();
//     } catch (error) {
//       console.error("TTS error:", error);
//       setIsAiSpeaking(false);
//       if (isCallActive) {
//         SpeechRecognition.startListening({ continuous: true });
//       }
//     }
//   };

//   if (!browserSupportsSpeechRecognition) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
//           <p className="text-red-600 font-medium">
//             Your browser doesn't support speech recognition.
//           </p>
//           <p className="text-sm text-red-500 mt-2">
//             Please use Chrome, Edge, or Safari for voice chat.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full items-center justify-center p-8">
//       <div className="max-w-2xl w-full space-y-8">
//         {/* Call Status */}
//         <div className="text-center space-y-4">
//           <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 ${
//             isCallActive 
//               ? isAiSpeaking 
//                 ? 'bg-blue-100 ring-8 ring-blue-500/20 animate-pulse' 
//                 : listening
//                 ? 'bg-red-100 ring-8 ring-red-500/20 animate-pulse'
//                 : 'bg-green-100 ring-8 ring-green-500/20'
//               : 'bg-gray-100'
//           }`}>
//             {isCallActive ? (
//               isAiSpeaking ? (
//                 <Volume2 className="w-16 h-16 text-blue-600" />
//               ) : listening ? (
//                 <Mic className="w-16 h-16 text-red-600" />
//               ) : (
//                 <MicOff className="w-16 h-16 text-gray-400" />
//               )
//             ) : (
//               <Phone className="w-16 h-16 text-gray-400" />
//             )}
//           </div>

//           <div className="space-y-2">
//             <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
//               {isCallActive ? 'Voice Chat Active' : 'Voice Chat'}
//             </h1>
//             <p className="text-gray-600">
//               {isCallActive 
//                 ? isAiSpeaking 
//                   ? 'AI is speaking...' 
//                   : listening 
//                   ? 'Listening to you...' 
//                   : 'Waiting...'
//                 : 'Start a voice conversation with Netics AI'
//               }
//             </p>
//             {listening && transcript && (
//               <p className="text-sm text-gray-500 italic">
//                 "{transcript}"
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Call Controls */}
//         <div className="flex justify-center gap-4">
//           {!isCallActive ? (
//             <Button
//               onClick={startCall}
//               className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-full shadow-lg"
//             >
//               <Phone className="w-6 h-6 mr-2" />
//               Start Voice Chat
//             </Button>
//           ) : (
//             <Button
//               onClick={endCall}
//               className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg rounded-full shadow-lg animate-pulse"
//             >
//               <PhoneOff className="w-6 h-6 mr-2" />
//               End Call
//             </Button>
//           )}
//         </div>

//         {/* Conversation History */}
//         {isCallActive && conversation.length > 0 && (
//           <div className="bg-white rounded-2xl border border-gray-200 p-6 max-h-96 overflow-y-auto space-y-4">
//             <h3 className="text-sm font-medium text-gray-500 mb-4">Conversation</h3>
//             {conversation.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`px-4 py-2 rounded-2xl max-w-[80%] ${
//                     msg.role === 'user'
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-100 text-gray-900'
//                   }`}
//                 >
//                   <p className="text-sm">{msg.text}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Instructions */}
//         {!isCallActive && (
//           <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-3">
//             <h3 className="font-medium text-gray-900">How it works:</h3>
//             <ul className="space-y-2 text-sm text-gray-600">
//               <li className="flex items-start gap-2">
//                 <span className="text-green-500 mt-0.5">●</span>
//                 Click "Start Voice Chat" to begin
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-blue-500 mt-0.5">●</span>
//                 Speak naturally - the AI will listen
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-purple-500 mt-0.5">●</span>
//                 The AI will respond with voice
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="text-red-500 mt-0.5">●</span>
//                 Click "End Call" when you're done
//               </li>
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
