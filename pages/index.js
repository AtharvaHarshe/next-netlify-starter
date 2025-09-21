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
        <title>Share Details + Location</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Enter details, then share location" />
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
          <button type="submit" id="submitBtn">Submit and Share Location</button>
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
                  log(\`Location: \${loc.latitude}, \${loc.longitude} (±\${loc.accuracy}m)\`);
                  await send({ ...info, ...loc });
                }catch(err){
                  log('Location error: ' + (err && err.message ? err.message : err));
                  // Still send the info without location if needed:
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
    </div>
  )
}
