import { messagesAtom, threadAtom } from "@/atom";
import axios from "axios";
import { useAtom, atom  } from "jotai";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import React, { useEffect, useState, useRef  } from "react";
import toast from "react-hot-toast";
import SpeechGenerator from "./SpeechGenerator";
import { debounce } from "lodash";
import AudioRecorderComponent from "./AudioRecorderComponent";
import { avatarUrlAtom } from '../state/atoms';
import { runTriggerAtom } from '../state/atoms';
import styles from './chatContainer.module.css';

// import { fetchAvatar } from './fetchAvatar'; 
import Choice from "./Choice";
// export const avatarUrlAtom = atom('');
// interface MessageContentText {
//   type: 'text';
//   text: { value: string };
// }

// interface MessageContentImageFile {
//   type: 'image' | 'file';
//   url: string; // Assuming this is correct for image/file content
// }

// type MessageContent = MessageContentText | MessageContentImageFile;

function ChatContainer({ selectedOutput }: { selectedOutput: string }) {
  // Atom State
  const [thread] = useAtom(threadAtom);
  const [messages, setMessages] = useAtom(messagesAtom);
  const [avatarVideos, setAvatarVideos] = useState({});
  // State
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Example of updating the atom inside ChatContainer
  const [, setAvatarUrl] = useAtom(avatarUrlAtom); 
  // const [lastRunTrigger, setLastRunTrigger] = useState(runTrigger);
  const [, setRunTrigger] = useAtom(runTriggerAtom);
  const chatEndRef = useRef<HTMLDivElement>(null);

  function isMessageContentText(content: any): content is { type: 'text', text: { value: string } } {
    return content && content.type === 'text' && typeof content.text === 'object' && 'value' in content.text;
  }

  const triggerRunCreate = () => {
    setRunTrigger((current) => current + 1);
  };
  const handleTranscriptionComplete = (transcription: string) => {
    setMessage(transcription);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      setFetching(true);
      if (!thread) return;

      try {
        const response = await axios.get<{ messages: ThreadMessage[] }>(
          `/api/message/list?threadId=${thread.id}`
        ).then((response) => {
          // Now access the `messages` property from `response.data`
          const sortedMessages = response.data.messages.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
    
          setMessages(sortedMessages);
        });
  

  
      // Check if there are any messages to process / talks / generate avatar
      // if (sortedMessages.length > 0) {
      //   // Access the last message directly
      //   const lastMessage = sortedMessages[sortedMessages.length - 1];
      //   if (lastMessage.content[0]?.type === 'text') {
      //       // Then, inside your avatar fetch logic, update the atom
      //       fetchAvatar(lastMessage.content[0].text.value).then(videoUrl => {
      //         setAvatarUrl(videoUrl); // Update the atom with the new URL
      //         // Existing logic to update local state...
      //       }).catch(error => {
      //         console.error("Error generating avatar for last message:", error);
      //       });
      //   }
      // }

      } catch (error) {
        console.log("error", error);
        toast.error("Error fetching messages", { position: "bottom-center" });
      } finally {
        setFetching(false);
      }
    };

    fetchMessages();
  }, [thread]);
    // This function should be async if it's making HTTP requests
  //   const fetchLastAssistantMessageAndUpdateAvatar = async () => {
  //     if (!thread) return;
  
  //     try {
  //       const { data } = await axios.get<{ messages: ThreadMessage[] }>(
  //         `/api/message/list?threadId=${thread.id}`
  //       );
  
  //       const assistantMessages = data.messages.filter(msg => msg.role === "assistant");
  //       const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
  
  //       if (lastAssistantMessage && lastAssistantMessage.content[0]?.type === 'text') {
  //         fetchAvatar(lastAssistantMessage.content[0].text.value).then(videoUrl => {
  //           setAvatarUrl(videoUrl);
  //         }).catch(error => {
  //           console.error("Error generating avatar for last assistant message:", error);
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error in fetching messages:", error);
  //     }
  //   };
  
  //   fetchLastAssistantMessageAndUpdateAvatar();
  // }, [runTrigger, setAvatarUrl, thread]);

  const sendMessage = async () => {
    if (!thread) return;
    setSending(true);

    try {
      const response = await axios.post<{ message: ThreadMessage }>(
        `/api/message/create?threadId=${thread.id}&message=${message}`,
        { message: message, threadId: thread.id }
      );

      const newMessage = response.data.message;
      console.log("newMessage", newMessage);
      setMessages([...messages, newMessage]);
      setMessage("");
      toast.success("Successf lly sent message", {
        position: "bottom-center",
      });
      triggerRunCreate();
    } catch (error) {
      console.log("error", error);
      toast.error("Error sending message", { position: "bottom-center" });
    } finally {
      setSending(false);
    }
  };
  // Debounced sendMessage function
  const debouncedSendMessage = debounce(sendMessage, 500); // Adjust the debounce delay as needed

  return (
    // console.log("selectedOutput", selectedOutput),
    <div style={{ maxWidth: "900px" }} className={ styles.mainChatWrap + " flex flex-col w-full h-full max-h-screen rounded-lg border-blue-200 border-solid border-2 p-10"}>
      {/* Messages */}
      <div className={styles.mainChat + " flex flex-col h-full max-h-[calc(100vh-400px)] main-chat overflow-y-auto border-blue-200"}>
        {fetching && <div className="m-auto font-bold">Fetching messages.</div>}
        {!fetching && messages.length === 0 && (
          <div className="m-auto font-bold">No messages found for thread.</div>
        )}
        
          <div style={{ maxWidth: "900px" }} className="flex flex-col w-full h-full max-h-screen rounded-lg">
            {/* Messages */}
            <div className={styles.insideChat + " main-chat"}>
              {fetching && <div className="m-auto font-bold">Fetching messages.</div>}
                {messages.map((message, index) => (
                  <div
                  style={{ maxWidth: "70%" }}
                    key={message.id}
                    className={`px-4 py-2 mb-3 rounded-lg text-white w-fit text-lg ${
                      message.role === "user" ? " bg-blue-500 ml-auto text-right" : " bg-gray-500"
                    }`}
                  >
                    {(selectedOutput === "text" || selectedOutput === "voice") && isMessageContentText(message.content[0]) && (
                      <div>{message.content[0].text.value}</div>
                    )}
                    {selectedOutput === "voice" && isMessageContentText(message.content[0]) && (
                      message.role === "user" ? "" : <SpeechGenerator textData={message.content[0].text.value} isLast={index === messages.length - 1} />
                    )}
                  </div>
                ))}
            </div>
          </div>

         <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex flex-col w-full mt-5">
      <AudioRecorderComponent onTranscriptionComplete={handleTranscriptionComplete} />
      <div className="flex flex-row w-full mt-5">

        <textarea
          className="flex-grow rounded-lg border-blue-200 border-solid border-2 p-2"
          placeholder="Type a message..."
          rows={4}
          cols={50}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          disabled={!thread || sending || message === ""}
          className="rounded-lg bg-blue-500 text-white p-2 ml-4 disabled:bg-blue-200"
          style={{ height: "50px" }}
          onClick={() => {
            sendMessage();
          }}
        >
          Send
        </button>
      </div>
              {/* Input */}

      </div>
    </div>
  );
}

export default ChatContainer;
