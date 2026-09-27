import { supabase } from '../config/supabase';
import { schemes, mockApplications } from '../repositories/mockStore';

async function seed() {
  console.log('Starting seed process...');

  const isLive = process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'http://localhost:54321';
  if (!isLive) {
    console.log('No live Supabase credentials found. Skipping database seeding.');
    console.log('To ingest data, configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    return;
  }

  // 1. Seed Schemes
  for (const scheme of schemes) {
    console.log(`Seeding scheme: ${scheme.shortName}`);
    
    // Check if scheme exists
    const { data: existing, error: findErr } = await supabase
      .from('schemes')
      .select('id')
      .eq('code', scheme.shortName)
      .single();
      
    if (findErr && findErr.code !== 'PGRST116') {
      console.error('Error finding scheme:', findErr.message);
      continue;
    }

    let schemeId = existing?.id;

    if (!schemeId) {
      const { data, error } = await supabase
        .from('schemes')
        .insert({
          code: scheme.shortName,
          name: scheme.name,
          status: 'active'
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Failed to create scheme:', error.message);
        continue;
      }
      schemeId = data.id;
    }

    // Insert scheme version
    const { error: vfErr } = await supabase
      .from('scheme_versions')
      .insert({
        scheme_id: schemeId,
        version: parseInt(scheme.version.replace('v', '')) || 1,
        config: scheme.config,
        status: scheme.status.toLowerCase()
      });
      
    if (vfErr) {
      console.error('Failed to seed scheme version:', vfErr.message);
    }
  }

  // 2. Seed Applications
  for (const app of mockApplications) {
    console.log(`Seeding application: ${app.id}`);
    
    const { error: appErr } = await supabase
      .from('applications')
      .insert({
        form_data: app.formData,
        current_state: app.status
      });
      
    if (appErr) {
      console.error('Failed to seed application:', appErr.message);
    }
  }

  console.log('Seeding completed successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error during seeding:', err);
    process.exit(1);
  });
