import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // No script on load; geolocation must be triggered by a user click
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Share Location</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Share your location" />
        <p className="description">
          Tap Start and allow location so a friend can find you.
        </p>

        <div>
          <button id="start">Start</button>
          <button id="stop" style={{ display: 'none' }}>Stop</button>
        </div>

        <pre id="status" style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const POST_ENDPOINT = '/.netlify/functions/capture';
              const statusEl = document.getElementById('status');
              const startBtn = document.getElementById('start');
              const stopBtn  = document.getElementById('stop');
              let watchId = null;

              function log(m){ statusEl.textContent += m + '\\n'; }

              async function send(payload){
                try{
                  const res = await fetch(POST_ENDPOINT, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(payload)
                  });
                  if(!res.ok) throw new Error('HTTP ' + res.status);
                }catch(e){ log('Send failed: ' + e.message); }
              }

              function start(){
                if(!('geolocation' in navigator)){
                  log('Geolocation not supported by this browser.');
                  return;
                }
                const opts = { enableHighAccuracy:true, maximumAge:10000, timeout:20000 };
                const ok = (pos)=>{
                  const { latitude, longitude, accuracy, speed, heading } = pos.coords;
                  const timestamp = pos.timestamp;
                  log(\`Location: \${latitude}, \${longitude} (±\${accuracy}m)\`);
                  send({ latitude, longitude, accuracy, speed, heading, timestamp });
                };
                const err = (e)=> log(\`Error (\${e.code}): \${e.message}\`);
                watchId = navigator.geolocation.watchPosition(ok, err, opts);
                startBtn.style.display='none';
                stopBtn.style.display='inline-block';
                log('Started. Please allow location when prompted.');
              }

              function stop(){
                if(watchId!==null){
                  navigator.geolocation.clearWatch(watchId);
                  watchId = null;
                }
                startBtn.style.display='inline-block';
                stopBtn.style.display='none';
                log('Stopped.');
                send({ stopped:true, timestamp: Date.now() });
              }

              startBtn.addEventListener('click', (e)=>{ e.preventDefault(); start(); });
              stopBtn.addEventListener('click',  (e)=>{ e.preventDefault(); stop();  });
            `,
          }}
        />
      </main>

      <Footer />
    </div>
  )
}

