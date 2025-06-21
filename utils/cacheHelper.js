const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Generic cache wrapper
const getOrSetCache = async (key, fetchFunction) => {
  const { data: cached, error } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', key)
    .maybeSingle();

  const now = new Date();

  if (cached && new Date(cached.expires_at) > now) {
    console.log(`✅ Cache HIT for ${key}`);
    return cached.value;
  }

  const freshData = await fetchFunction();

  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 min TTL

  await supabase
    .from('cache')
    .upsert({ key, value: freshData, expires_at: expiresAt });

  console.log(`⚡ Cache MISS — storing fresh data for ${key}`);
  return freshData;
};

module.exports = { getOrSetCache };
