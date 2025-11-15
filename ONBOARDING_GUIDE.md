# HAVIT Onboarding Flow - Complete Guide

## Overview

The HAVIT onboarding system is a 4-phase interactive flow that builds a detailed user persona using AI:

1. **Profile Setup** - Basic user information
2. **Universal Questions** - 5 questions everyone answers
3. **Conditional Questions** - 10 personalized questions based on branch
4. **Character Selection** - Choose champion archetype

---

## Flow Diagram

```
Signup → Profile Setup → Universal Questions → Conditional Questions → Persona Generation → Character Select → Dashboard
```

---

## Phase 1: Profile Setup

**Route:** `/onboarding/profile`  
**Component:** `ProfileSetup.tsx`

### Collected Data:
- Full Name
- Age (18-100)
- Gender (Male/Female/Non-binary/Prefer not to say)
- Location (optional)
- Preferred Language
- Username
- Avatar/Character Style

### Features:
- One field per screen (mobile-friendly)
- Progress bar showing step X/7
- Sage AI comments on each step
- Smooth slide animations
- Skip button for optional fields
- Auto-save to Firestore

---

## Phase 2: Universal Questions

**Route:** `/onboarding/universal-questions`  
**Component:** `UniversalQuestions.tsx`

### Questions (5 total):

**Q1: Biggest Struggle?**
- Type: Radio buttons with icons
- Options: Staying consistent, Getting started, Finding motivation, Doing too much, Losing interest

**Q2: What sounds most fun?**
- Type: Grid of icon buttons
- Options: Beating friend's record, Leveling up character, Leading squad, Personal bests, Solving challenges, Helping others

**Q3: If you miss a habit?**
- Type: Slider/List selection
- Options: Try harder, Ask for help, Analyze why, Shrug off, Need encouragement, Set easier goal

**Q4: What motivates you? (Rank top 2)**
- Type: Ranking/Selection
- Options: Progress charts, Team cheers, Rival competition, Personal streaks, Unlocking abilities, Recognition

**Q5: How do you want to feel after a successful week?**
- Type: Carousel
- Options: Victorious, Supported, Proud, Smart, Part of community, Surprised

### Features:
- One question at a time
- Large emoji icons
- Sage AI commentary
- Confetti animation on completion
- Previous/Next navigation

---

## Phase 3: Conditional Questions

**Route:** `/onboarding/conditional-questions`  
**Component:** `ConditionalQuestions.tsx`

### Branch Logic

The system analyzes Phase 2 answers and assigns user to one of 6 branches:

#### **Branch A: RELENTLESS_COMPETITOR**
*Triggered when:* funPreference includes "beating" OR topMotivators includes "rival competition"

Questions focus on: Competitive drive, leaderboards, winning vs crushing, streak loss reactions

#### **Branch B: THOUGHTFUL_ANALYST**
*Triggered when:* funPreference includes "challenges" AND missResponse includes "analyze"

Questions focus on: Data insights, weekly reports, chart preferences, optimization

#### **Branch C: SOCIAL_BUTTERFLY**
*Triggered when:* funPreference includes "squad/helping" OR topMotivators includes "team cheers/recognition"

Questions focus on: Squad challenges, community engagement, social features

#### **Branch D: INTERNAL_ACHIEVER**
*Triggered when:* topMotivators includes "personal streaks" AND funPreference includes "personal bests"

Questions focus on: Private milestones, journaling, reflection, personal growth

#### **Branch E: OVERWHELMED_BEGINNER**
*Triggered when:* struggles includes "getting started" OR missResponse includes "need encouragement"

Questions focus on: Small wins, encouragement, simplicity, flexibility

#### **Branch F: COMEBACK_PLAYER**
*Triggered when:* None of the above (default fallback)

Questions focus on: Restart rituals, comeback motivation, flexible goals

### Question Types:
- **Toggle:** Yes/No switch
- **Slider:** 0-100 scale with left/right labels
- **Radio:** Multiple choice with emoji
- **Binary:** Two-option choice

---

## Phase 4: Persona Generation

**Service:** `personaGenerator.ts`

### Process:
1. Collect all responses from Phases 1-3
2. Send to Gemini AI with structured prompt
3. Receive detailed persona JSON
4. Save to Firestore `users/{userId}/onboardingResponses/persona`

### Persona Structure:
```typescript
{
  personaName: string;           // "The Relentless Competitor"
  archetype: string;             // "competitor"
  strengths: string[];           // ["Highly motivated", "Thrives under pressure"]
  challenges: string[];          // ["May burnout", "Discouraged by losses"]
  recommendedHabits: string[];   // ["Daily workout", "Compete with friends"]
  sageBehavior: {
    tone: string;                // "aggressive"
    frequency: number;           // 7 (messages per week)
    topics: string[];            // ["leaderboard", "challenges"]
    motivationLever: string;     // "winning"
  };
  retentionStrategy: string;     // How to keep them engaged
  churnRisks: string[];          // What might make them quit
  interventionStrategy: string;  // How to re-engage
}
```

### Fallback System:
If Gemini API fails or is not configured, uses rule-based persona generation with predefined templates for each branch.

---

## Firestore Schema

```typescript
users/{userId}/ {
  // Profile Setup
  onboardingResponses: {
    profileSetup: {
      fullName: string;
      age: number;
      gender: string;
      location?: string;
      language: string;
      username: string;
      avatar: string;
      profileCompletedAt: timestamp;
    },
    
    // Universal Questions
    universalQuestions: {
      struggles: string;
      funPreference: string;
      missResponse: string;
      topMotivators: [string, string];
      successFeeling: string;
      completedAt: timestamp;
    },
    
    // Conditional Questions
    conditionalQuestions: {
      personaBranch: string;        // "RELENTLESS_COMPETITOR"
      branchResponses: {
        q1: any;
        q2: any;
        // ... q10
      };
      completedAt: timestamp;
    },
    
    // Generated Persona
    persona: {
      personaName: string;
      archetype: string;
      strengths: string[];
      challenges: string[];
      recommendedHabits: string[];
      sageBehavior: {...};
      retentionStrategy: string;
      churnRisks: string[];
      interventionStrategy: string;
    },
    
    onboardingCompleted: boolean;
  }
}
```

---

## Environment Variables

### Required in `frontend/.env.local`:

```bash
# Gemini AI (for persona generation)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase (already configured)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# ... other Firebase vars
```

### Get Gemini API Key:
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to `.env.local`

---

## Testing Flow

### Complete Flow Test:
1. Clear Firestore user data
2. Sign up with new account
3. Go through Profile Setup (7 steps)
4. Answer Universal Questions (5 questions)
5. System determines branch
6. Answer Conditional Questions (10 questions)
7. Persona generated automatically
8. Redirected to Character Select
9. Choose champion
10. Enter Dashboard

### Branch Testing:

**Test RELENTLESS_COMPETITOR:**
- Q2: Select "Beating a friend's record"
- Q4: Rank "Rival competition" in top 2

**Test THOUGHTFUL_ANALYST:**
- Q2: Select "Solving tricky challenges"
- Q3: Select "Analyze why I failed"

**Test SOCIAL_BUTTERFLY:**
- Q2: Select "Leading a squad to victory"
- Q4: Rank "Team cheers" in top 2

**Test INTERNAL_ACHIEVER:**
- Q2: Select "Getting personal bests"
- Q4: Rank "Personal streaks" in top 2

**Test OVERWHELMED_BEGINNER:**
- Q1: Select "Getting started"
- Q3: Select "Need encouragement"

**Test COMEBACK_PLAYER:**
- Don't match any of the above criteria

---

## UI/UX Features

### Animations:
- Slide in from right when question changes
- Confetti on phase completion
- Smooth progress bar transitions
- Fade in/out for Sage comments

### Mobile-First:
- Single column layout
- Large touch targets
- Responsive emoji sizes
- Stack navigation on small screens

### Accessibility:
- Proper label associations
- Keyboard navigation
- Screen reader friendly
- High contrast mode support

### Design System:
- Dark theme: `#1A1F3A` background
- Primary: `#7C3AED` (purple)
- Success: Green accents
- Warning: Orange/yellow
- Card-based layout
- Border radius: 8px

---

## Integration Points

### After Onboarding:
1. **Dashboard:** Show recommended habits from persona
2. **Sage AI:** Use sageBehavior.tone and topics for conversations
3. **Notifications:** Use sageBehavior.frequency for message cadence
4. **Features:** Enable/disable based on persona archetype
5. **Challenges:** Suggest challenges matching persona
6. **Squad:** Match with similar archetypes

### Persona Usage Examples:

```typescript
// In Sage AI
const userPersona = userData.onboardingResponses?.persona;
const tone = userPersona?.sageBehavior?.tone || 'encouraging';

if (tone === 'aggressive') {
  message = "Come on! You can do better than this!";
} else if (tone === 'encouraging') {
  message = "You're doing great! Keep it up!";
}

// In Habit Recommendations
const recommendedHabits = userPersona?.recommendedHabits || [];
showHabitSuggestions(recommendedHabits);

// In Retention Logic
const churnRisks = userPersona?.churnRisks || [];
if (isAtRisk(user, churnRisks)) {
  executeIntervention(userPersona?.interventionStrategy);
}
```

---

## Troubleshooting

### Persona not generating?
- Check Gemini API key in `.env.local`
- System will use fallback persona templates
- Check console for Gemini API errors

### Questions not appearing?
- Ensure universal questions completed first
- Check Firestore for saved responses
- Verify branch determination logic

### Routing issues?
- Ensure user is authenticated
- Check ProtectedRoute wrapper
- Verify App.tsx route configuration

### Firestore save failing?
- Check Firebase rules allow writes to users collection
- Ensure user is authenticated
- Check browser console for permission errors

---

## Future Enhancements

- [ ] A/B test different question phrasings
- [ ] ML model for better branch prediction
- [ ] Persona refinement over time
- [ ] Multi-language support for questions
- [ ] Video/audio question explanations
- [ ] Social proof (show % who picked each option)
- [ ] Progressive persona updates based on behavior
- [ ] Persona sharing/comparison features

---

## Files Created

```
frontend/src/
├── pages/Onboarding/
│   ├── ProfileSetup.tsx             (Phase 1)
│   ├── UniversalQuestions.tsx       (Phase 2)
│   └── ConditionalQuestions.tsx     (Phase 3)
├── services/
│   └── personaGenerator.ts          (Gemini integration)
├── hooks/
│   └── useWindowSize.ts             (Confetti helper)
└── App.tsx                          (Updated routing)
```

---

## Dependencies Added

```json
{
  "@google/generative-ai": "^latest",  // Gemini AI SDK
  "react-confetti": "^latest"          // Celebration animations
}
```

---

## Summary

✅ **Complete 3-phase onboarding system**  
✅ **60 unique conditional questions across 6 branches**  
✅ **Gemini AI persona generation with fallback**  
✅ **Mobile-first responsive design**  
✅ **Smooth animations and celebrations**  
✅ **Firestore integration for all data**  
✅ **Production-ready TypeScript code**  

**The onboarding flow is now fully functional and ready for testing!** 🚀
