import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CreateAdmin() {
  const [msg, setMsg] = useState('Wait...');
  useEffect(() => {
    async function init() {
      try {
        const { data: { user }, error: se } = await supabase.auth.signUp({
          email: 'fadelayad21@gmail.com',
          password: 'Ala0711%©',
          options: { data: { full_name: 'Ayad Fadel' } }
        });
        if (se) { setMsg('Error: ' + se.message); return; }
        if (user) {
          const { error: pe } = await supabase.from('profiles').update({
            balance: 21000,
            total_profit: 162000,
            full_name: 'Ayad Fadel'
          }).eq('id', user.id);
          if (pe) { setMsg('User OK, Profile Update Fail: ' + pe.message); }
          else { setMsg('SUCCESS: Ayad Fadel Account Ready.'); }
        }
      } catch (e: any) { setMsg('Crash: ' + e.message); }
    }
    init();
  }, []);
  return <div style={{background:'#070b14',color:'#10b981',padding:20,fontFamily:'monospace'}}>{msg}</div>;
}
