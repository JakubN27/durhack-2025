import { textModel } from '../config/gemini.js'

/**
 * Extract skills from user bio using Gemini AI
 */
export async function extractSkills(bioText) {
  const prompt = `
Analyze the following user bio and extract skills.

User Bio:
"""
${bioText}
"""

Extract and categorize skills into two categories:
1. Skills the user can TEACH (based on their expertise, experience, accomplishments)
2. Skills the user wants to LEARN (based on their interests, goals, aspirations)

For each skill, provide:
- name: the skill name
- proficiency: beginner/intermediate/advanced (for teach skills) or desired level (for learn skills)
- category: technical/creative/business/language/other

Return ONLY a valid JSON object in this exact format:
{
  "teach_skills": [
    {"name": "Python", "proficiency": "advanced", "category": "technical"},
    {"name": "Guitar", "proficiency": "intermediate", "category": "creative"}
  ],
  "learn_skills": [
    {"name": "Japanese", "proficiency": "beginner", "category": "language"},
    {"name": "Machine Learning", "proficiency": "intermediate", "category": "technical"}
  ]
}

Important: Return ONLY the JSON object, no additional text.
`

  try {
    const result = await textModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }
    
    const skills = JSON.parse(jsonText)
    
    // Validate structure
    if (!skills.teach_skills || !skills.learn_skills) {
      throw new Error('Invalid skill extraction response')
    }
    
    return skills
  } catch (error) {
    console.error('Error extracting skills:', error)
    throw new Error('Failed to extract skills from bio')
  }
}

/**
 * Generate a learning plan for a skill exchange
 */
export async function generateLearningPlan(teacherSkills, learnerGoals, sessionCount = 6) {
  const prompt = `
Create a structured learning plan for a skill exchange.

Teacher's Skills: ${JSON.stringify(teacherSkills)}
Learner's Goals: ${JSON.stringify(learnerGoals)}
Number of Sessions: ${sessionCount}

Create a ${sessionCount}-session learning roadmap with:
- Session number and title
- Topics to cover
- Practical exercises
- Expected outcomes
- Difficulty progression

Return ONLY a valid JSON array in this format:
[
  {
    "session": 1,
    "title": "Introduction to Python Basics",
    "topics": ["Variables", "Data types", "Basic operators"],
    "exercises": ["Write a hello world program", "Create simple calculator"],
    "outcomes": ["Understand Python syntax", "Run first program"],
    "difficulty": "beginner"
  }
]

Important: Return ONLY the JSON array, no additional text.
`

  try {
    const result = await textModel.generateContent(prompt)
    const response = await result.response
    let text = response.text().trim()
    
    // Extract JSON
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '')
    }
    
    const plan = JSON.parse(text)
    return plan
  } catch (error) {
    console.error('Error generating learning plan:', error)
    throw new Error('Failed to generate learning plan')
  }
}

/**
 * Generate session summary and motivational nudges
 */
export async function generateSessionSummary(sessionNotes, participantEngagement) {
  const prompt = `
Analyze this learning session and provide a summary with motivational insights.

Session Notes: ${sessionNotes}
Engagement Level: ${participantEngagement}

Generate:
1. A brief summary of what was covered
2. Key achievements
3. Areas for improvement
4. Motivational message for both participants
5. Suggested next steps

Return ONLY a valid JSON object in this format:
{
  "summary": "Brief overview of the session",
  "achievements": ["Achievement 1", "Achievement 2"],
  "improvements": ["Area to work on"],
  "motivation": "Encouraging message",
  "next_steps": ["Next action 1", "Next action 2"]
}

Important: Return ONLY the JSON object, no additional text.
`

  try {
    const result = await textModel.generateContent(prompt)
    const response = await result.response
    let text = response.text().trim()
    
    // Extract JSON
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '')
    }
    
    const summary = JSON.parse(text)
    return summary
  } catch (error) {
    console.error('Error generating session summary:', error)
    throw new Error('Failed to generate session summary')
  }
}
