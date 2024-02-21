"use client";
// import MmenuWrapper from './components/MmenuWrapper';
import { useEffect, useState  } from "react";
import Assistant from "./components/Assistant";
import SpeechGenerator from "./components/SpeechGenerator";
import AudioRecorderComponent from "./components/AudioRecorderComponent";
import AssistantFile from "./components/AssistantFile";
import TalkingAvatar from './components/TalkingAvatar';
import Header from "./components/Header";
import Choice from "./components/Choice";
import { useAtom } from "jotai";
import {
  assistantAtom,
  fileAtom,
  runStateAtom,
  threadAtom,
  isValidRunState,
  assistantFileAtom,
  runAtom, 
} from "@/atom";
import Thread from "./components/Thread";
import Run from "./components/Run";
import ChatContainer from "./components/ChatContainer";
import AdminContent from "./components/AdminContent";
import { runTriggerAtom } from './state/atoms';
export default function Home() {
  // Atom State
  const [, setAssistant] = useAtom(assistantAtom);
  const [, setFile] = useAtom(fileAtom);
  const [, setAssistantFile] = useAtom(assistantFileAtom);
  const [, setThread] = useAtom(threadAtom);
  const [, setRun] = useAtom(runAtom);
  const [, setRunState] = useAtom(runStateAtom);
  const [selectedOutput, setselectedOutput] = useState('text');
  const [avatarVideoUrl, setAvatarVideoUrl] = useState('');
  const [avatarUrl] = useAtom(runTriggerAtom);
  const handleChoiceChange = (choice: string) => {
    setselectedOutput(choice);
  };
  // Load default data
  useEffect(() => {
    if (typeof window !== "undefined") {


      if( localStorage ) {
        const localAssistant = localStorage.getItem("assistant");

        if (localAssistant) {
          setAssistant(JSON.parse(localAssistant));
        }
        const localFile = localStorage.getItem("file");
        if (localFile) {
          setFile(localFile);
        }
        const localAssistantFile = localStorage.getItem("assistantFile");
        if (localAssistantFile) {
          setAssistantFile(localAssistantFile);
        }
        const localThread = localStorage.getItem("thread");
        if (localThread) {
          if( localThread != undefined ) {
            setThread(JSON.parse(localThread));
          }
        }
        const localRun = localStorage.getItem("run");
        if (localRun) {
          setRun(JSON.parse(localRun));
        }
        const localRunState = localStorage.getItem("runState");
        if (localRunState && isValidRunState(localRunState)) {
          setRunState(localRunState);
        }
        
      }

    }
  }, []);

  return (
    <main className="flex flex-col">
      <Header />
      <div className="flex flex-col mt-20 gap-x-10">
        {/* Actions */}
        <div className="flex flex-col w-full">
          {/* <MmenuWrapper /> */}
          <AdminContent />

          <Choice selectedOutput={selectedOutput} onChange={handleChoiceChange} />
          {/* <h1>Talking Avatar Demo</h1>
          <TalkingAvatar videoUrl={avatarVideoUrl} /> */}
        </div>
        {/* Chat */}
        <div className="w-full flex flex-row gap-x-10 items-center">
          {/* <TalkingAvatar videoUrl={"https://web-throne.org/erstehero.mp4"} /> */}
          <ChatContainer selectedOutput={selectedOutput} />
        </div>
      </div>
    </main>
  );
}
