import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzttuzosppjslpszjtyp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHR1em9zcHBqc2xwc3pqdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzA1NTUsImV4cCI6MjA4NTA0NjU1NX0.53iQzP4xof2mK1p0pUBMEdSVTvTXw7CfXTzXnmoZG4w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Starting account creation...');
  
  const email = 'fadelayad21@gmail.com';
  const password = 'Ala0711%©';
  const fullName = 'Ayad Fadel';

  // 1. Sign up/in
  let userId;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('User already registered. Signing in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.error('Sign in failed:', signInError.message);
        return;
      }
      userId = signInData.user.id;
    } else {
      console.error('Signup error:', authError.message);
      return;
    }
  } else {
    userId = authData.user.id;
    console.log('User signed up. ID:', userId);
  }

  if (userId) {
    await updateProfile(userId);
  }
}

async function updateProfile(userId) {
  console.log('Attempting to update profile for:', userId);
  
  // Try to update - if 'profiles' doesn't exist, this will fail
  const { data, error } = await supabase
    .from('profiles')
    .update({
      balance: 21000,
      total_profit: 162000,
      full_name: 'Ayad Fadel'
    })
    .eq('id', userId);

  if (error) {
    console.error('Update error:', error.message);
    console.log('Trying insert instead...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        balance: 21000,
        total_profit: 162000,
        full_name: 'Ayad Fadel'
      });
    if (insertError) console.error('Insert error:', insertError.message);
    else console.log('Profile inserted successfully!');
  } else {
    console.log('Profile updated successfully!');
  }
}

main();
