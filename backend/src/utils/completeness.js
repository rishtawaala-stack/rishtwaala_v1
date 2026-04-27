/**
 * Calculates the completion percentage of a profile from the unified user_information table
 */
function calculateProfileCompletion(profile) {
  if (!profile) return 0;

  let total = 0;

  // 1. Core Identity (20%) - Name, Gender, DOB
  if (profile.full_name && profile.full_name !== "User") total += 10;
  if (profile.gender && profile.dob) total += 10;

  // 2. Photo (10%)
  if (profile.profile_photo_url) total += 10;

  // 3. Bio & Interests (10%)
  if (profile.bio) total += 5;
  if (profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0) total += 5;

  // 4. Professional (10%)
  if (profile.education_level && profile.education_level !== "Not specified") total += 5;
  if (profile.occupation_detail && profile.occupation_detail !== "Not specified") total += 5;

  // 5. Demographics (10%)
  if (profile.annual_income_range && profile.annual_income_range !== "Not specified") total += 5;
  if (profile.current_city && profile.current_city !== "Not specified") total += 5;

  // 6. Culture & Physical (10%)
  if (profile.religion && profile.religion !== "Not specified") total += 5;
  if (profile.height_cm || profile.age) total += 5;

  // 7. Family (15%) - Significant contribution
  if (profile.family_type || profile.father_name || profile.mother_name) total += 15;

  // 8. Partner Preferences (15%) - Significant contribution
  if (profile.pref_age_min || profile.pref_religion || profile.pref_diet || profile.pref_height_min_cm) total += 15;

  return Math.min(total, 100);
}

module.exports = { calculateProfileCompletion };
