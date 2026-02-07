import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../constants';
import { Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-white pt-20 pb-10 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="invert brightness-0 grayscale opacity-80 hover:opacity-100 transition-opacity">
                            {/* Reusing Logo but we might want a white version. For now using text/existing Logo component might look odd if it has dark text. 
                     The Logo component has hardcoded text colors. I should probably adjust the Logo component to accept className for colors or just hardcode white text here.
                     For safety, I'll rebuild the logo visual here for the footer to ensure it's white.
                 */}
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-emerald-500" />
                                </div>
                                <span className="font-bold text-xl tracking-tighter text-emerald-500">GLOBAL <span className="text-white">FISHERS</span></span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Institutional-grade asset management platform delivering alpha through quantitative excellence and strategic foresight.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Ecosystem</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="/plans" className="hover:text-emerald-400 transition-colors flex items-center gap-2">Investment Tiers</Link></li>
                            <li><Link to="/calculator" className="hover:text-emerald-400 transition-colors flex items-center gap-2">Yield Calculator</Link></li>
                            <li><Link to="/withdrawal-policy" className="hover:text-emerald-400 transition-colors flex items-center gap-2">Withdrawal Policy</Link></li>
                            <li><Link to="/signup" className="hover:text-emerald-400 transition-colors flex items-center gap-2">Open Account</Link></li>
                        </ul>
                    </div>

                    {/* Trust & Support */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Trust & Support</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="/security" className="hover:text-emerald-400 transition-colors">Vault Security</Link></li>
                            <li><Link to="/compliance" className="hover:text-emerald-400 transition-colors">Regulatory Compliance</Link></li>
                            <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                            <li><Link to="/support" className="hover:text-emerald-400 transition-colors">Help Center & FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>
                                    12 Financial District Blvd,<br />
                                    Canary Wharf, London, E14 5AB<br />
                                    United Kingdom
                                </span>
                            </li>

                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-emerald-500 flex-shrink-0" />
                                <span>support@globalfishers.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
                    <div>
                        &copy; {new Date().getFullYear()} Global Fishers Investment Ltd.
                    </div>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
                        <Link to="/risk" className="hover:text-slate-300">Risk Disclosure</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
