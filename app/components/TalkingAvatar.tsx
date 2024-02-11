// components/TalkingAvatar.js
import React, { useState } from 'react';
import axios from 'axios';

interface TalkingAvatarProps {
    videoUrl: string; // Add this prop
  }

  const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ videoUrl }) => {
    return (
      <div>
        {videoUrl && <video src={videoUrl} controls autoPlay />}
      </div>
    );
  };

  /**
   * Used in generate button static response just as an example
   */
// const TalkingAvatar:  React.FC<TalkingAvatarProps> = ({ textData }) => {
//     const [videoUrl, setVideoUrl] = useState('');

//     const fetchAvatar = async (scriptText: string) => {
//         try {
//             const response = await axios.post<IDIDResponse>('https://api.d-id.com/talks', {
//                 script: {
//                     type: "text",
//                     input: scriptText,
//                 },
//                 source_url: "https://web-throne.org/erstehero.jpg", // Example image URL, replace with your own
//                 webhook: "https://host.domain.tld/to/webhook", // Your webhook URL
//             }, {
//                 headers: {
//                     'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
//                 },
//             });
    
//             const talkId = response.data.id;
//             let resultReady = false;
//             console.log("Generating avatar for:", scriptText); // Placeholder for actual implementation
//             // Polling logic
//             const checkResultStatus = async () => {
//                 const result = await axios.get<IDIDResponse>(`https://api.d-id.com/talks/${talkId}`, {
//                     headers: {
//                         'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
//                     },
//                 });
    
//                 if (result.data.status === "done") {
//                     resultReady = true;
//                     setVideoUrl(result.data.result_url!); // Assuming result_url is populated when done
//                 } else {
//                     // Repeat after a delay if not ready
//                     setTimeout(checkResultStatus, 5000); // Check every 5 seconds, adjust as needed
//                 }
//             };
    
//             checkResultStatus();
//         } catch (error) {
//             console.error("Failed to fetch the talking avatar:", error);
//         }
//     };


    
//     // Simple UI for demonstration
//     return (
//         <div>
//             <button onClick={() => fetchAvatar("Hey man.")}>Generate Avatar</button>
//             {videoUrl && <video src={videoUrl} controls />}
//         </div>
//     );
// };

export default TalkingAvatar;
