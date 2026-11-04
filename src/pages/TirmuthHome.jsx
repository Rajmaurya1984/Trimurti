import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/site/SiteHeader.jsx'
import { PROJECT } from '../data/project.js'
export default function Home() {
  const video = useRef(null)
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState(false)
  const hasVideo = Boolean(PROJECT.homeVideo) && !failed
  async function toggleVideo() {
    if (!video.current) return
    if (video.current.paused) {
      try { await video.current.play() } catch { setPaused(true) }
    } else video.current.pause()
  }
  return <main className="tm-home">
    {hasVideo && <video ref={video} className="tm-hero-video" autoPlay muted playsInline loop poster={PROJECT.homePoster || undefined} onError={() => setFailed(true)} onPause={() => setPaused(true)} onPlay={() => setPaused(false)}><source src={PROJECT.homeVideo} type="video/mp4" /></video>}
    <div className="tm-hero-shade" />
    <SiteHeader />
    {/* <section className="tm-hero-copy">
      <p className="tm-eyebrow">A DIFFERENT PERSPECTIVE ON HOME</p>
      <h1 className="tm-bracket-title"><span>An address<br /><em>beyond arrival.</em></span></h1>
      <p>A space to belong.<br />A life to make your own.</p>
      <Link className="tm-cta" to="/location">EXPLORE THE ADDRESS <span aria-hidden="true">&#8599;</span></Link>
    </section> */}
    {/* <footer className="tm-hero-footer"><span>{PROJECT.name} <i /> RESIDENCES</span>{hasVideo && <button onClick={toggleVideo}>{paused ? 'PLAY FILM' : 'PAUSE FILM'}</button>}<Link to="/amenities">DISCOVER MORE &#8599;</Link></footer> */}
  </main>
}



