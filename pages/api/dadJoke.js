import axios from 'axios';

export const config = {
  runtime: 'edge',
};

const JOKE_API = 'https://icanhazdadjoke.com/';
const OG_IMAGE_API = `https://dad-jokes-vert.vercel.app/api/generateImage`;

async function fetchRandomJoke() {
  try {
    const response = await axios.get(JOKE_API, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Dad Jokes Farcaster Frame (https://github.com/yourusername/dad-jokes-frame)'
      }
    });
    if (response.status === 200) {
      return response.data.joke;
    } else {
      throw new Error('Failed to fetch joke');
    }
  } catch (error) {
    console.error('Error fetching random joke:', error);
    return null;
  }
}

export default async function handler(req) {
  console.log('Received request to /api/dadJoke');
  console.log('Request method:', req.method);

  if (req.method === 'POST') {
    try {
      console.log('Attempting to fetch random joke...');
      const joke = await fetchRandomJoke();
      
      if (joke) {
        console.log('Successfully fetched a random joke:', joke);
        
        // Generate OG image URL
        const ogImageUrl = `${OG_IMAGE_API}?` + new URLSearchParams({
          text: joke
        }).toString();
        
        console.log('Generated OG Image URL:', ogImageUrl);

        // Verify if the image can be generated
        const imageResponse = await fetch(ogImageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to generate image: ${imageResponse.statusText}`);
        }

        const shareText = encodeURIComponent("Grab a laugh with these Dad jokes!\n\nFrame by @aaronv.eth");
        const shareUrl = encodeURIComponent("https://dad-jokes-vert.vercel.app");
        const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${shareUrl}`;

        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Dad Joke</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${ogImageUrl}" />
              <meta property="fc:frame:button:1" content="Another Joke" />
              <meta property="fc:frame:post_url" content="https://dad-jokes-vert.vercel.app/api/dadJoke" />
              <meta property="fc:frame:button:2" content="Share" />
              <meta property="fc:frame:button:2:action" content="link" />
              <meta property="fc:frame:button:2:target" content="${shareLink}" />
            </head>
            <body>
              <h1>Dad Joke</h1>
              <p>${joke}</p>
            </body>
          </html>
        `,
          {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
            },
          }
        );
      } else {
        throw new Error('Failed to fetch a random joke');
      }
    } catch (error) {
      console.error('Error in dadJoke handler:', error);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://dad-jokes-vert.vercel.app/error.png" />
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:post_url" content="https://dad-jokes-vert.vercel.app/api/dadJoke" />
          </head>
          <body>
            <h1>Error</h1>
            <p>An unexpected error occurred. Please try again!</p>
          </body>
        </html>
      `,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }
  } else {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Method Not Allowed</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="https://dad-jokes-vert.vercel.app/error.png" />
          <meta property="fc:frame:button:1" content="Go Back" />
          <meta property="fc:frame:post_url" content="https://dad-jokes-vert.vercel.app/api/dadJoke" />
        </head>
        <body>
          <h1>Method Not Allowed</h1>
          <p>This endpoint only accepts POST requests.</p>
        </body>
      </html>
    `,
      {
        status: 405,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}