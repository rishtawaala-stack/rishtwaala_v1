/**
 * Calculates a match percentage between two profiles based on various criteria.
 * Criteria include direct profile comparisons and preference matching.
 */
function calculateMatchScore(p1, p2) {
  let score = 0;
  let totalWeight = 0;

  const isInvalid = (val) => !val || val === "Not specified" || val === "Other";

  // 1. Core Demographics (Weight: 20)
  totalWeight += 20;
  if (!isInvalid(p1.religion) && p1.religion === p2.religion) score += 10;
  else if (isInvalid(p1.religion)) score += 5; // Neutral

  if (!isInvalid(p1.mother_tongue) && p1.mother_tongue === p2.mother_tongue) score += 10;
  else if (isInvalid(p1.mother_tongue)) score += 5;

  // 2. Location (Weight: 15)
  totalWeight += 15;
  if (!isInvalid(p1.current_state) && p1.current_state === p2.current_state) {
    score += 10;
    if (!isInvalid(p1.current_city) && p1.current_city === p2.current_city) score += 5;
  } else if (isInvalid(p1.current_state)) {
    score += 7;
  }

  // 3. Education & Profession (Weight: 15)
  totalWeight += 15;
  if (!isInvalid(p1.education_level) && p1.education_level === p2.education_level) score += 7;
  if (!isInvalid(p1.occupation_type) && p1.occupation_type === p2.occupation_type) score += 8;

  // 4. Lifestyle (Weight: 10)
  totalWeight += 10;
  if (!isInvalid(p1.diet) && p1.diet === p2.diet) score += 5;
  if (!isInvalid(p1.smoking) && p1.smoking === p2.smoking) score += 2.5;
  if (!isInvalid(p1.drinking) && p1.drinking === p2.drinking) score += 2.5;

  // 5. Preference Matching (Weight: 40)
  const checkPreference = (user, preference) => {
    let prefScore = 0;
    let prefWeight = 0;

    if (preference) {
      const getPref = (key) => preference[key] !== undefined ? preference[key] : preference[`pref_${key}`];

      // Age matching
      prefWeight += 10;
      const ageMin = getPref('age_min') || 18;
      const ageMax = getPref('age_max') || 100;
      if (user.age && user.age >= ageMin && user.age <= ageMax) {
        prefScore += 10;
      } else if (!user.age) {
        prefScore += 5;
      }

      // Height matching
      prefWeight += 5;
      const hMin = getPref('height_min_cm') || 0;
      const hMax = getPref('height_max_cm') || 300;
      if (user.height_cm && user.height_cm >= hMin && user.height_cm <= hMax) {
        prefScore += 5;
      }

      // Religion preference
      const relPref = getPref('religion');
      if (relPref && Array.isArray(relPref) && relPref.length > 0) {
        prefWeight += 10;
        if (relPref.includes(user.religion)) prefScore += 10;
      }

      // Caste preference
      const castePref = getPref('caste');
      if (castePref && Array.isArray(castePref) && castePref.length > 0) {
        prefWeight += 10;
        if (castePref.includes(user.caste)) prefScore += 10;
      }
    }

    return prefWeight > 0 ? (prefScore / prefWeight) * 20 : 15;
  };

  score += checkPreference(p2, p1); 
  score += checkPreference(p1, p2); 
  totalWeight += 40;

  // Normalize to 100
  let finalScore = Math.min(100, Math.max(0, Math.floor((score / totalWeight) * 100)));
  
  // Seed for stability and small variance
  // Ensure same result for both (p1, p2) and (p2, p1)
  const id1 = p1.id.replace(/-/g, '').substring(0, 8);
  const id2 = p2.id.replace(/-/g, '').substring(0, 8);
  const combinedId = (parseInt(id1, 16) + parseInt(id2, 16)).toString();
  const variance = (parseInt(combinedId.substring(0, 2)) % 10) - 5; // -5 to +5

  return Math.min(99, Math.max(40, finalScore + variance));
}

module.exports = { calculateMatchScore };
