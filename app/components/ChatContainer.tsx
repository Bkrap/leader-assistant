import { messagesAtom, threadAtom } from "@/atom";
import axios from "axios";
import { useAtom } from "jotai";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SpeechGenerator from "./SpeechGenerator";
import { debounce } from "lodash";
import AudioRecorderComponent from "./AudioRecorderComponent";
import Choice from "./Choice";


function ChatContainer({ selectedOutput }: { selectedOutput: string }) {
  // Atom State
  const [thread] = useAtom(threadAtom);
  const [messages, setMessages] = useAtom(messagesAtom);

  // State
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleTranscriptionComplete = (transcription: string) => {
    setMessage(transcription);
  };

  // const [ setSelectedOutput ] = useState('text'); // Initialize with the default value 'text'
  // const handleChoiceChange = (choice: string) => {
  //   setSelectedOutput(choice);
  // };
  // console.log("selectedOutput", handleChoiceChange);

  // const [latestAIMessage, setLatestAIMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      setFetching(true);
      if (!thread) return;

      try {
        axios
          .get<{ messages: ThreadMessage[] }>(
            `/api/message/list?threadId=${thread.id}`
          )
          .then((response) => {
            let newMessages = response.data.messages;

            // Sort messages in descending order by createdAt
            newMessages = newMessages.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
            setMessages(newMessages);
          });
      } catch (error) {
        console.log("error", error);
        toast.error("Error fetching messages", { position: "bottom-center" });
      } finally {
        setFetching(false);
      }
    };

    fetchMessages();
  }, [thread]);

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
      toast.success("Successfully sent message", {
        position: "bottom-center",
      });
    } catch (error) {
      console.log("error", error);
      toast.error("Error sending message", { position: "bottom-center" });
    } finally {
      setSending(false);
    }
  };
  // Debounced sendMessage function
  const debouncedSendMessage = debounce(sendMessage, 500); // Adjust the debounce delay as needed

      // Input change handler with debounced sendMessage
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    debouncedSendMessage();
  };
  return (
    console.log("selectedOutput", selectedOutput),
    <div className="flex flex-col w-full h-full max-h-screen rounded-lg border-blue-200 border-solid border-2 p-10">
      {/* Messages */}
      <div className="flex flex-col h-full max-h-[calc(100vh-400px)] overflow-y-auto border-blue-200 border-solid border-2 p-6 rounded-lg">
        {fetching && <div className="m-auto font-bold">Fetching messages.</div>}
        {!fetching && messages.length === 0 && (
          <div className="m-auto font-bold">No messages found for thread.</div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`px-4 py-2 mb-3 rounded-lg text-white w-fit text-lg ${
              message.role === "user"
                ? " bg-blue-500 ml-auto text-right"
                : " bg-gray-500"
            }`}
          >
          { selectedOutput === "text" 
            ? (message.content[0].type === "text" 
                ? message.content[0].text.value 
                : null)
            : selectedOutput === "voice" 
              ? <SpeechGenerator textData={message.content[0].text.value} />
              : <SpeechGenerator textData={message.content[0].text.value} /> 
            ? (selectedOutput === "both" ? <SpeechGenerator textData={message.content[0].text.value} /> : null) 
            : null
          }
          </div>
        ))}
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
