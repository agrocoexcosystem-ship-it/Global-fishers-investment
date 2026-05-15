import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight">
                <span className="text-emerald-400">GLOBAL</span>
                <span className="text-white ml-1.5">FISHERS</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Professional asset management combining algorithmic precision with human expertise for consistent, superior returns.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/plans', label: 'Investment Plans' },
                { to: '/calculator', label: 'Yield Calculator' },
                { to: '/support', label: 'Support' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-emerald-400 transition">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/risk', label: 'Risk Disclosure' },
                { to: '/compliance', label: 'Compliance' },
                { to: '/withdrawal-policy', label: 'Withdrawal Policy' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-emerald-400 transition">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail size={14} className="text-emerald-400" />
                <span>support@global-fishers.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={14} className="text-emerald-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={14} className="text-emerald-400 mt-0.5" />
                <span>Global Fishers Investment Ltd.<br/>Financial District, New York</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} Global Fishers Investment. All rights reserved.</p>
          <p className="mt-1 text-slate-500">Trading involves risk. Past performance is not indicative of future results.</p>
        </div>
      </div>
    </footer>
  );
}
