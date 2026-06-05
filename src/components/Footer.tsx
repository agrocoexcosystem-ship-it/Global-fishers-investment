import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Coins } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-500 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-8 w-8 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Coins size={16} className="text-slate-950" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">PXX</span>
                <span className="text-white ml-1 text-xs font-light uppercase tracking-widest opacity-80">Platform</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              PXX represents the next evolution of digital asset management, combining high-yield smart contract staking, DEX services, and quantitative bot terminals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/plans', label: 'Ecosystem Plans' },
                { to: '/calculator', label: 'Yield Calculator' },
                { to: '/support', label: 'Support & Chat' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-amber-400 transition">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/risk', label: 'Risk Disclosure' },
                { to: '/compliance', label: 'Compliance Index' },
                { to: '/withdrawal-policy', label: 'Withdrawal Policy' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-amber-400 transition">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center space-x-2">
                <Mail size={12} className="text-amber-400" />
                <span className="text-slate-400">support@pxx-xtreme.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={12} className="text-amber-400" />
                <span className="text-slate-400">+49 15 216 228 753</span>
              </li>
              <li className="flex items-center space-x-2">
                <Send size={12} className="text-amber-400" />
                <a href="https://t.me/PXXXtremeXchange" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition text-slate-400">@PXXXtremeXchange</a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={12} className="text-amber-400 mt-0.5" />
                <span className="text-slate-400">PXX Xtreme Xchange Ltd.<br/>Financial District, New York</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-8 text-center text-[10px] text-slate-600">
          <p>© 2026 PXX Xtreme Xchange. All rights reserved.</p>
          <p className="mt-1">Ecosystem participation involves risk. Smart contracts can carry vulnerabilities. Past yields do not promise future returns.</p>
        </div>
      </div>
    </footer>
  );
}
