const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'your_openrouter_api_key_here';

/**
 * Calculate match score using AI
 * @param {Object} user1 - Current user profile
 * @param {Object} user2 - Potential match profile
 * @returns {Promise<number>} - Score between 0 and 100
 */
async function getAIMatchScore(user1, user2) {
  try {
    const prompt = `
      You are an elite matrimony compatibility engine. Analyze these two profiles deeply.
      
      User 1 (The Matcher):
      - Name: ${user1.full_name}
      - Background: ${user1.age}y/o ${user1.gender}, ${user1.religion} (${user1.caste}), ${user1.mother_tongue}
      - Professional: ${user1.occupation_detail} (${user1.occupation_type}), Education: ${user1.education_level}
      - Lifestyle: ${user1.diet} diet, Smoking: ${user1.smoking}, Drinking: ${user1.drinking}
      - Preferences: Age ${user1.pref_age_min}-${user1.pref_age_max}, Religion: ${user1.pref_religion}, Diet: ${user1.pref_diet}
      
      User 2 (The Match):
      - Name: ${user2.full_name}
      - Background: ${user2.age}y/o ${user2.gender}, ${user2.religion} (${user2.caste}), ${user2.mother_tongue}
      - Professional: ${user2.occupation_detail} (${user2.occupation_type}), Education: ${user2.education_level}
      - Lifestyle: ${user2.diet} diet, Smoking: ${user2.smoking}, Drinking: ${user2.drinking}
      - Bio: ${user2.bio || "No bio provided"}

      Task: 
      1. Compare background alignment (Culture, Language, Religion).
      2. Compare professional alignment (Status, Aspirations).
      3. Compare lifestyle alignment.
      4. Provide a compatibility score from 0 to 100.
      
      Respond ONLY with a JSON object:
      {
        "score": number, 
        "reason": "short detailed insight"
      }
    `;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemma-2-9b-it:free',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://rishtawaala.com',
        'X-Title': 'Rishtawaala Matrimony'
      },
      timeout: 10000
    });

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    return Math.min(100, Math.max(10, result.score || 50));
  } catch (error) {
    console.error("AI Matching Error:", error.message);
    // Fallback to basic logic if AI fails
    return null; 
  }
}

module.exports = { getAIMatchScore };
