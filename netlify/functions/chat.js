exports.handler = async function (event) {

    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }

    try {

        // Get conversation history from the browser
        const body = JSON.parse(event.body);

        const conversationHistory = body.contents;

        if (!conversationHistory) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Conversation history is missing."
                })
            };
        }


        // IMPORTANT:
        // The API key is stored in Netlify,
        // NOT inside your frontend JavaScript.

        const API_KEY = process.env.GEMINI_API_KEY;


        if (!API_KEY) {

            console.error(
                "GEMINI_API_KEY is not configured."
            );

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Gemini API key is not configured."
                })
            };
        }


        // Gemini model
        const MODEL = "gemini-3.6-flash";


        // Gemini API URL
        const API_URL =
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;


        // Send request to Gemini
        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY
            },

            body: JSON.stringify({
                contents: conversationHistory
            })

        });


        const data = await response.json();


        // Gemini returned an error
        if (!response.ok) {

            console.error(
                "Gemini API error:",
                data
            );

            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error:
                        data?.error?.message ||
                        "Gemini API request failed."
                })
            };
        }


        // Return Gemini response to browser
        return {
            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        };


    } catch (error) {

        console.error(
            "Server error:",
            error
        );

        return {
            statusCode: 500,

            body: JSON.stringify({
                error:
                    "Server error: " +
                    error.message
            })
        };
    }
};
