const supabase = require("./src/services/supabase.service");

async function check() {
    const userId = "082c310d-1133-43a0-9087-8fd3c2f82d4f";
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    if (error) {
        console.error("Auth Error:", error);
    } else {
        console.log("Auth User metadata:", user.user.user_metadata);
        console.log("Auth User phone:", user.user.phone);
    }

    const { data: publicUser, error: pubErr } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    console.log("Public User data:", publicUser);
}

check();
