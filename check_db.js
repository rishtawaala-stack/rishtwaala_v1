const supabase = require("./backend/src/services/supabase.service");

async function checkPolicies() {
  const { data: profiles } = await supabase.from('user_information').select('id').limit(2);
  if (profiles && profiles.length >= 2) {
    const from = profiles[0].id;
    const to = profiles[1].id;
    console.log(`Checking existing from ${from} to ${to}...`);
    const { data: existing } = await supabase
        .from("connectRequests")
        .select("id")
        .eq("from_profile", from)
        .eq("to_profile", to)
        .maybeSingle();
    
    console.log("Existing check:", existing);

    console.log(`Trying insert from ${from} to ${to}...`);
    const { data, error } = await supabase
          .from("connectRequests")
          .insert({ 
            from_profile: from, 
            to_profile: to, 
            status: 'pending' 
          })
          .select()
          .maybeSingle();

    console.log("Insert result:", { data, error });
  } else {
    console.log("Not enough profiles.");
  }
}

checkPolicies();
