import Head from 'next/head';
import { useEffect } from 'react';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://flower-flip.vercel.app';
  return { props: { baseUrl } };
}

export default function Home({ baseUrl }) {
  useEffect(() => {
    console.log('Build time:', process.env.NEXT_PUBLIC_BUILD_TIME);
  }, []);

  return (
    <>
      <Head>
        <title>Flowers Galore</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${baseUrl}/flower_flip_img.png`} />
        <meta property="fc:frame:button:1" content="Flowers Galore" />
        <meta property="fc:frame:post_url" content={`${baseUrl}/api/flower_flip`} />

        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/compose?text=Enjoy+some+pretty+flowers!%0A%0AFrame+by+%40aaronv.eth" />
      </Head>
      <main>
        <h1>Dad Jokes!</h1>
        <img src={`${baseUrl}/flower_flip_img.png`} alt="Flora Flip" width={500} height={300} />
        <p>If you can see this image, static file serving is working.</p>
      </main>
    </>
  );
}
