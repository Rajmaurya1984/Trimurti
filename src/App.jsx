import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import BracketTransition from './components/site/BracketTransition.jsx'
import SiteHeader from './components/site/SiteHeader.jsx'
import Home from './pages/TirmuthHome.jsx'
import Experience from './pages/Experience.jsx'
import { PROJECT } from './data/project.js'
import './styles/tirmuth.css'
function Layout() { return <BracketTransition /> }
function RouteError() { return <><SiteHeader /><main className="tm-placeholder"><h1>This view could not open.</h1><a href="/">Return home</a></main></> }
const router = createBrowserRouter([{
  Component: Layout, ErrorBoundary: RouteError,
  children: [
    { index: true, Component: Home },
    ...['location', 'flat', 'amenities'].map(page => ({ path: page, element: <Experience key={page} kind={page} /> })),
    { path: 'amenities/interior', lazy: async () => PROJECT.ready.amenities ? 
      ({ Component: (await import('./pages/InteriorAmenities.jsx')).default }) :
      ({ element: <Experience kind='amenities' /> }) },
    { path: 'windowview', element: <Navigate to="/flat" replace /> },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
}])
export default function App() { return <RouterProvider router={router} /> }



