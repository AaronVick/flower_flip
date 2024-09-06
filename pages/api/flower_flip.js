export const config = {
  runtime: 'edge',
};

async function fetchFlowerArray() {
  // Fetch the flower array from the environment variable (assumed to be a comma-separated list of URLs)
  const flowerArray = process.env.flower_array ? process.env.flower_array.split(',') : [];
  console.log(`flower_array contents: ${flowerArray}`);
  return flowerArray;
}

async function generateErrorImage(text) {
  const OG_IMAGE_API = `https://flower-flip.vercel.app/api/generateImage`;
  console.log(`Generating error image with text: ${text}`);
  const ogImageUrl = `${OG_IMAGE_API}?` + new URLSearchParams({
    text: text
  }).toString();

  const imageResponse = await fetch(ogImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to generate error image: ${imageResponse.statusText}`);
  }
  return ogImageUrl;
}

export default async function handler(req) {
  // Base URL dynamically created from request headers or environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
  console.log(`Base URL resolved to: ${baseUrl}`);

  if (req.method === 'POST') {
    try {
      // Get the current index from the request body or default to 0
      const { searchParams } = new URL(req.url);
      let currentIndex = parseInt(searchParams.get('index')) || 0;
      const direction = searchParams.get('direction') || 'next'; // next or previous

      // Fetch the array of flower images from the environment variable
      const flowerArray = await fetchFlowerArray();
      if (flowerArray.length === 0) {
        console.log('No images found in flower_array.');
        throw new Error('No images found in flower array');
      }

      // Ensure that an image is selected
      let imageUrl = flowerArray[0]; // Default to the first image
      if (direction === 'next') {
        currentIndex = (currentIndex + 1) % flowerArray.length;  // Cycle forward
      } else if (direction === 'previous') {
        currentIndex = (currentIndex - 1 + flowerArray.length) % flowerArray.length;  // Cycle backward
      }

      // Get the image URL for the current index
      imageUrl = flowerArray[currentIndex] || flowerArray[0];  // Fallback to the first image
      console.log(`Displaying image at index ${currentIndex}: ${imageUrl}`);

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
            <meta property="fc:frame:post_url" content="${baseUrl}/api/flowerImage?index=${currentIndex}&direction=next" />
            <meta property="fc:frame:button:1:method" content="POST" />
            <meta property="fc:frame:button:2" content="Previous" />
            <meta property="fc:frame:post_url:2" content="${baseUrl}/api/flowerImage?index=${currentIndex}&direction=previous" />
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
    } catch (error) {
      console.error('Error in flowerImage handler:', error);

      // Generate a fallback error image
      const errorImageUrl = await generateErrorImage("Error: No images available.");
      console.log(`Generated error image URL: ${errorImageUrl}`);

      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${errorImageUrl}" />
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:post_url" content="${baseUrl}/api/flowerImage?index=0&direction=next" />
            <meta property="fc:frame:button:1:method" content="POST" />
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
    console.error('Method Not Allowed: ', req.method);
    return new Response('Method Not Allowed', { status: 405 });
  }
}
