import {
  assistantAtom,
  messagesAtom,
  runAtom,
  runStateAtom,
  threadAtom,
  // runTriggerAtom, 
} from "@/atom";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { Run } from "openai/resources/beta/threads/runs/runs.mjs";
import toast from "react-hot-toast";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import { runTriggerAtom } from '../state/atoms';


function Run() {
  // Atom State
  const [thread] = useAtom(threadAtom);
  const [run, setRun] = useAtom(runAtom);
  const [, setMessages] = useAtom(messagesAtom);
  const [assistant] = useAtom(assistantAtom);
  const [runState, setRunState] = useAtom(runStateAtom);
  // const [, setRunTrigger] = useAtom(runTriggerAtom);
  // const [, runTrigger] = useAtom(runTriggerAtom);
  const [runTrigger, setRunTrigger] = useAtom(runTriggerAtom); // Correctly destructure to use both getter and setter
  // State
  const [creating, setCreating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] =
    useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (creating) {
        return;
      }
      const createRunIfNotInProgress = async () => {
        console.log("this is run", run)
        // if (run) {
          // if( run.completed_at !== null ) {
            await handleCreate();
          // }
        // }
      };
      createRunIfNotInProgress();
    }, [runTrigger]); 

  const startPolling = (runId: string) => {
    if (!thread) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get<{ run: Run }>(
          `/api/run/retrieve?threadId=${thread.id}&runId=${runId}`
        );
        const updatedRun = response.data.run;

        setRun(updatedRun);
        setRunState(updatedRun.status);

        if (
          ["cancelled", "failed", "completed", "expired"].includes(
            updatedRun.status
          )
        ) {
          clearInterval(intervalId);
          setPollingIntervalId(null);
          fetchMessages();
        }
      } catch (error) {
        console.error("Error polling run status:", error);
        clearInterval(intervalId);
        setPollingIntervalId(null);
      }
    }, 500);

    setPollingIntervalId(intervalId);
  };

  const handleCreate = async () => {
    if (!assistant || !thread) return;

    setCreating(true);
    try {
      const response = await axios.get<{ run: Run }>(
        `/api/run/create?threadId=${thread.id}&assistantId=${assistant.id}`
      );

      const newRun = response.data.run;
      if( newRun ) {
        setRunState(newRun.status);
        setRun(newRun);
        toast.success("Run created", { position: "bottom-center" });
        localStorage.setItem("run", JSON.stringify(newRun));
        // Start polling after creation
        startPolling(newRun.id);
        setRunTrigger((oldTrigger: number) => oldTrigger + 1); // Increment trigger to signal an update
      }
    } catch (error) {
      toast.error("Error creating run. Check Assistant API", { position: "bottom-center" });
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async () => {
    if (!run || !thread) return;

    setCanceling(true);
    try {
      const response = await axios.get<{ run: Run }>(
        `/api/run/cancel?runId=${run.id}&threadId=${thread.id}`
      );

      const newRun = response.data.run;
      setRunState(newRun.status);
      setRun(newRun);
      toast.success("Run canceled", { position: "bottom-center" });
      localStorage.setItem("run", JSON.stringify(newRun));
    } catch (error) {
      toast.error("Error canceling run.", { position: "bottom-center" });
      console.error(error);
    } finally {
      setCanceling(false);
    }
  };

  const fetchMessages = async () => {
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
    }
  };

  return (
    <div className="flex flex-col mb-8">
      <h1 className="text-4xl font-semibold mb-4">Run</h1>
      <div className="flex flex-row gap-x-4 w-full flex-wrap flex-col gap-y-2">
        <Button
          onClick={handleCreate}
          disabled={creating || !assistant || !thread}
        >
          {creating ? "Creating..." : "Create"}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={["N/A"].includes(runState) || !run}
        >
          {canceling ? "Canceling..." : "Cancel"}
        </Button>
      </div>
    </div>
  );
}

export default Run;
