// fetchAvatar.js
import axios from 'axios';

/**
 * Fetches an avatar video URL based on the provided script text.
 * @param {string} scriptText The text script for the avatar to speak.
 * @returns {Promise<string>} A promise that resolves to the URL of the generated video.
 */
export async function fetchAvatar(scriptText) {
    try {
        const response = await axios.post('https://api.d-id.com/talks', {
            script: {
                type: "text",
                input: scriptText,
            },
            source_url: "https://web-throne.org/erstehero.jpg",
            webhook: "https://host.domain.tld/to/webhook",
        }, {
            headers: {
                'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
            },
        });

        const talkId = response.data.id;
        // Polling logic to check when the video is ready
        return new Promise((resolve, reject) => {
            const checkResultStatus = async () => {
                try {
                    const result = await axios.get(`https://api.d-id.com/talks/${talkId}`, {
                        headers: {
                            'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
                        },
                    });

                    if (result.data.status === "done") {
                        resolve(result.data.result_url); // Resolve the promise with the video URL
                    } else {
                        setTimeout(checkResultStatus, 5000); // Check every 5 seconds
                    }
                } catch (error) {
                    reject("Failed to fetch the talking avatar status: " + error);
                }
            };

            checkResultStatus();
        });
    } catch (error) {
        console.error("Failed to fetch the talking avatar:", error);
        return Promise.reject("Failed to initiate the talking avatar generation: " + error);
    }
}
