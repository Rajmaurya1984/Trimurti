import { FOOTER } from '../../data/site.js'
import './SiteChrome.css'

export default function SiteFooter({ caption = FOOTER.caption }) {
  return (
    <footer className="site-footer">
      <span>
        67 AVENUE <i /> <small>{FOOTER.year}</small>
      </span>
      <p>
        {caption} <em>↗</em>
      </p>
    </footer>
  )
}