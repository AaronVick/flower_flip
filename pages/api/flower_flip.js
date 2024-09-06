import axios from 'axios';

export const config = {
  runtime: 'edge',
};

const PIXABAY_API = `https://pixabay.com/api/?key=${process.env.API_KEY}&q=flowers&image_type=photo`;
const OG_IMAGE_API = `https://flower-flip.vercel.app/api/generateImage`;

async function fetchFlowerImages(page = 1) {
  try {
    const response = await axios.get(`${PIXABAY_API}&page=${page}`);
    if (response.status === 200) {
      return response.data.hits; // Returns array of image objects
    } else {
      throw new Error('Failed to fetch images');
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    return null;
  }
}

async function generateErrorImage(text) {
  const ogImageUrl = `${OG_IMAGE_API}?` + new URLSearchParams({
    text: text
  }).toString();

  // Verify if the image can be generated
  const imageResponse = await fetch(ogImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to generate error image: ${imageResponse.statusText}`);
  }
  return ogImageUrl;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || 1;

  // Use the environment variable for the base URL or fallback to req.headers.host
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
  console.log(`Base URL resolved to: ${baseUrl}`);

  if (req.method === 'POST') {
    try {
      const images = await fetchFlowerImages(page);

      if (images && images.length > 0) {
        // Pick a random image from the page set
        const randomIndex = Math.floor(Math.random() * images.length);
        const imageUrl = images[randomIndex].webformatURL;  // Random image

        // Share URL
        const shareText = encodeURIComponent("Check out this beautiful flower image!");
        const shareLink = `https://warpcast.com/~/compose?text=${shareText}`;

        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Flower Image</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${imageUrl}" />
              <meta property="fc:frame:button:1" content="Next" />
              <meta property="fc:frame:post_url" content="${baseUrl}/api/flower_flip?page=${parseInt(page) + 1}" />
              <meta property="fc:frame:button:1:method" content="POST" />
              <meta property="fc:frame:button:2" content="Previous" />
              <meta property="fc:frame:post_url:2" content="${baseUrl}/api/flower_flip?page=${Math.max(1, parseInt(page) - 1)}" />
              <meta property="fc:frame:button:2:method" content="POST" />
            </head>
            <body>
              <h1>Flower Image</h1>
              <img src="${imageUrl}" alt="Flower Image" />
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
        throw new Error('No images found');
      }
    } catch (error) {
      console.error('Error in flowerImage handler:', error);

      // Generate a fallback error image
      const errorImageUrl = await generateErrorImage("Error: No images available.");

      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${errorImageUrl}" />
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:post_url" content="${baseUrl}/api/flower_flip" />
          </head>
          <body>
            <h1>Error</h1>
            <p>An unexpected error occurred. Please try again!</p>
            <img src="${errorImageUrl}" alt="Error Image" />
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
    return new Response('Method Not Allowed', { status: 405 });
  }
}
