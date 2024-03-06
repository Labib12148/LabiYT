const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); 

const port = process.env.PORT || 10101;

// Set up multer for handling file uploads

app.use(express.static('public'));
app.use(express.json());

const API_KEY = "YOUR API KEY"


async function runChat(userInput) {
  
    try {
      const stripHtmlTags = (html) => {
        return html.replace(/<[^>]*>?/gm, ''); // Replace HTML tags with an empty string
      };
      
      // Fetch YouTube videos using YouTube Data API with maxResults set to 15 and type=video to filter out non-video content
      const youtubeResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&q=${encodeURIComponent(userInput)}&type=video&safeSearch=strict&maxResults=10`);
      const youtubeData = await youtubeResponse.json();
      
      // Extract video recommendations and links
      const videoRecommendations = youtubeData.items.map(item => ({
          title: stripHtmlTags(item.snippet.title), // Remove HTML tags from the title
          videoId: item.id.videoId,
          link: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
      
      // Create response text with video recommendations and links
    let responseText = `Here are some recommended YouTube videos based on "${userInput}":\n`;
      videoRecommendations.forEach(video => {
          responseText += `- ${video.title}: <a href="${video.link}" target="_blank" style="color: #007bff;">${video.link}</a>\n`; // Embed video links as HTML anchor tags
      });

    let newUserRole = {
        role: "user",
        parts: userInput,
    };

    let newAIRole = {
        role: "model",
        parts: responseText
    };

    history.push(newUserRole);
    history.push(newAIRole);
    console.log(history)

      return responseText;
    } catch (error) {
        console.error("Error fetching YouTube data:", error);
        return "Sorry, I couldn't fetch YouTube recommendations based on your query at the moment.";
    }
  }


app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    
    // Check if the response is null or undefined
    if (!response) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json({ response });
  } 
  catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
