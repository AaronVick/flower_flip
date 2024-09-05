import axios from 'axios';

export const config = {
  runtime: 'edge',
};

const FACT_API = 'https://uselessfacts.jsph.pl/random.json?language=en';
const OG_IMAGE_API = `https://funfacts-xi.vercel.app/api/generateImage`;

async function fetchRandomFact() {
  try {
    const response = await axios.get(FACT_API);
    if (response.status === 200) {
      return response.data.text;
    } else {
      throw new Error('Failed to fetch fact');
    }
  } catch (error) {
    console.error('Error fetching random fact:', error);
    return null;
  }
}

export default async function handler(req) {
  console.log('Received request to /api/findFact');
  console.log('Request method:', req.method);

  if (req.method === 'POST') {
    try {
      console.log('Attempting to fetch random fact...');
      const fact = await fetchRandomFact();
      
      if (fact) {
        console.log('Successfully fetched a random fact:', fact);
        
        // Generate OG image URL
        const ogImageUrl = `${OG_IMAGE_API}?` + new URLSearchParams({
          text: fact
        }).toString();
        
        console.log('Generated OG Image URL:', ogImageUrl);

        // Verify if the image can be generated
        const imageResponse = await fetch(ogImageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to generate image: ${imageResponse.statusText}`);
        }

        const shareText = encodeURIComponent("Take a moment from the grind and read some fun facts.\n\nFrame by @aaronv.eth");
        const shareUrl = encodeURIComponent("https://funfacts-xi.vercel.app/");
        const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${shareUrl}`;

        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Fun Fact</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${ogImageUrl}" />
              <meta property="fc:frame:button:1" content="Another Fact" />
              <meta property="fc:frame:post_url" content="https://funfacts-xi.vercel.app/api/findFact" />
              <meta property="fc:frame:button:2" content="Share" />
              <meta property="fc:frame:button:2:action" content="link" />
              <meta property="fc:frame:button:2:target" content="${shareLink}" />
            </head>
            <body>
              <h1>Fun Fact</h1>
              <p>${fact}</p>
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
        throw new Error('Failed to fetch a random fact');
      }
    } catch (error) {
      console.error('Error in findFact handler:', error);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="https://funfacts-xi.vercel.app/error.png" />
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:post_url" content="https://funfacts-xi.vercel.app/api/findFact" />
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
          <meta property="fc:frame:image" content="https://funfacts-xi.vercel.app/error.png" />
          <meta property="fc:frame:button:1" content="Go Back" />
          <meta property="fc:frame:post_url" content="https://funfacts-xi.vercel.app/api/findFact" />
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