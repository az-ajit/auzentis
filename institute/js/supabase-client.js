// Auzentis Institute — shared Supabase client init.
// Mirrors Auzentis Suite's pattern exactly (CDN script + createClient with
// project URL + anon/public key). The anon key is PUBLIC BY DESIGN — all real
// access control is enforced by Postgres Row Level Security
// (auzentis_institute_supabase_schema.sql), never by hiding this key.
//
// SETUP REQUIRED: create a NEW, separate Supabase project for the Institute
// (do not reuse Suite's project — see DECISIONS_AND_ASSUMPTIONS.md), then
// replace the two placeholders below with that project's URL and anon key
// (Project Settings -> API in the Supabase dashboard).

const SUPABASE_URL = "https://YOUR-INSTITUTE-PROJECT.supabase.co"; // TODO: replace after creating the Supabase project
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY"; // TODO: replace — this is the public anon key, not the service role key

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Edge Function base (same project, /functions/v1/<name>)
function edgeFunctionUrl(name) {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

async function callEdgeFunction(name, body) {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch(edgeFunctionUrl(name), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Edge function call failed");
  return json;
}
