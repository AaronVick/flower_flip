import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

function getRandomDarkColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 50 + Math.random() * 30; // 50-80%
  const lightness = 15 + Math.random() * 20; // 15-35%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');

    if (!text) {
      return new Response('Missing text parameter', { status: 400 });
    }

    const backgroundColor = getRandomDarkColor();

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            backgroundColor,
            backgroundSize: '150px 150px',
            height: '100%',
            width: '100%',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            flexWrap: 'nowrap',
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontStyle: 'normal',
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              color: 'white',
              marginTop: 30,
              padding: '0 120px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {text}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    return imageResponse;
  } catch (e) {
    console.error('Error generating image:', e);
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}