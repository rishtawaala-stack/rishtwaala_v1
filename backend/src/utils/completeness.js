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

  // 3. Bio & Lifestyle (10%)
  if (profile.bio) total += 10;

  // 4. Professional (20%)
  if (profile.education_level && profile.education_level !== "Not specified") total += 10;
  if (profile.occupation_detail && profile.occupation_detail !== "Not specified") total += 10;

  // 5. Demographics & Financial (20%)
  if (profile.annual_income_range && profile.annual_income_range !== "Not specified") total += 10;
  if (profile.current_city && profile.current_city !== "Not specified") total += 10;

  // 6. Culture & Physical (20%)
  if (profile.religion && profile.religion !== "Not specified") total += 10;
  if (profile.height_cm || profile.age) total += 10;

  return Math.min(total, 100);
}

module.exports = { calculateProfileCompletion };
