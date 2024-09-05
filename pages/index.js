import Head from 'next/head';
import { useEffect } from 'react';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://funfacts-xi.vercel.app';
  return { props: { baseUrl } };
}

export default function Home({ baseUrl }) {
  useEffect(() => {
    console.log('Build time:', process.env.NEXT_PUBLIC_BUILD_TIME);
  }, []);

  return (
    <>
      <Head>
        <title>Grab a Fun Fact</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${baseUrl}/funfacts.png`} />
        <meta property="fc:frame:button:1" content="Get a Fun Fact" />
        <meta property="fc:frame:post_url" content={`${baseUrl}/api/findFact`} />

        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/compose?text=Enjoy+some+random+fun+facts+in+/success.%0A%0AFrame+by+%40aaronv.eth" />
      </Head>
      <main>
        <h1>Grab a Fun Fact!</h1>
        <img src={`${baseUrl}/funfacts.png`} alt="Fun Facts" width={500} height={300} />
        <p>If you can see this image, static file serving is working.</p>
      </main>
    </>
  );
}
