
import { Link } from 'react-router-dom'
import logo from "../assets/logo.jpg";

const links = [
  { label: 'About', to: '#' },
  { label: 'Careers', to: '#' },
  { label: 'Blog', to: '#' },
  { label: 'Support', to: '#' },
  { label: 'Privacy', to: '/tandc_privacy_policy.pdf' },
  { label: 'Terms', to: '/tandc_privacy_policy.pdf' }
]

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container-xl py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                <div className="relative mr-8">
                  <img
                    src={logo}
                    alt="Plabonic"
                    className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <span className="absolute -top-1 -right-6 sm:-right-8 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
                    Beta
                  </span>
                </div>
              </Link>
              {/* <span className="text-xl font-bold">Plabonic<span className="text-brand">.com</span></span> */}
            </div>
            <p className="mt-3 text-sm text-gray-600">A modern job platform for tech roles. This is a demo clone for educational use.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {links.map(l => (
              <Link key={l.label} to={l.to} className="text-sm text-gray-700 hover:text-brand">{l.label}</Link>
            ))}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Plabonic</p>
          <p>Made with ❤️</p>
        </div>
      </div>
    </footer>
  )
}
