# Challenges Feature - Complete Documentation

## Overview

The Challenges feature allows users to compete with friends in real-time habit duels. Users can create challenges, track progress, and see who's leading in their habit-building journey.

---

## Files Created/Modified

### 1. Service Layer
**File:** `frontend/src/services/challengesService.ts`

**Functions:**
- `getChallenges(userId)` - Fetch all challenges for a user
- `subscribeToChallenges(userId, callback)` - Real-time listener for challenges
- `createChallenge(...)` - Create a new challenge
- `updateChallengeProgress(challengeId, field, increment)` - Update progress
- `updateChallengeStatus(challengeId, status)` - Update challenge status
- `deleteChallenge(challengeId)` - Delete a challenge
- `calculateChallengeStats(challenges)` - Compute statistics
- `calculateDaysLeft(endDate)` - Calculate remaining days
- `calculateLead(myProgress, opponentProgress)` - Calculate lead difference

**Types:**
```typescript
interface Challenge {
  id: string;
  userId: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  habitId: string;
  habitName: string;
  habitCategory: string;
  status: 'active' | 'victory' | 'defeated' | 'tied';
  duration: number;
  myProgress: number;
  opponentProgress: number;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ChallengeStats {
  activeCount: number;
  victoriesCount: number;
  defeatsCount: number;
  uniqueOpponents: number;
  totalChallenges: number;
}
```

---

### 2. Hooks Layer
**File:** `frontend/src/hooks/useChallenges.ts`

**Hooks:**

1. **`useChallenges(userId)`**
   - Fetches all challenges with real-time updates
   - Returns: `{ challenges, loading, error }`
   - Uses Firebase onSnapshot for live updates

2. **`useChallengeStats(challenges)`**
   - Computes statistics from challenges array
   - Returns: `ChallengeStats` object
   - Auto-updates when challenges change

3. **`useChallenge(challenge)`**
   - Computes values for individual challenge
   - Returns:
     - `daysLeft` - Days remaining
     - `lead` - Lead difference
     - `myPercentage` - Your completion percentage
     - `opponentPercentage` - Opponent's completion percentage
     - `competitionStatus` - Status message and color
     - `isComplete` - Whether challenge is finished

---

### 3. UI Components
**File:** `frontend/src/pages/ChallengesPage.tsx`

**Main Component:** `ChallengesPage`

**Sub-Component:** `ChallengeCard`

---

## Features

### 1. Header Section
- **Title:** "Challenges" with Swords icon
- **Subtitle:** "Compete with friends in real-time habit duels"
- **Action Button:** "New Challenge" (navigates to `/challenges/new`)

### 2. Stats Dashboard
Three stat cards displaying:
- **Active Challenges** (Swords icon, warning color)
- **Victories** (Trophy icon, success color)
- **Opponents** (Users icon, primary color)

### 3. Challenge Cards
Each challenge card shows:

**Header:**
- Habit name
- Status badge (Active/Victory/Defeated/Tied)
- Opponent info with avatar

**Progress Tracking:**
- Your progress bar with percentage
- Opponent's progress bar with percentage
- Days completed / Total days

**Competition Status (Active only):**
- 🎯 "You're leading by X days!" (green)
- ⚡ "Opponent is ahead by X days" (warning)
- 🤝 "Tied! Keep pushing!" (primary)

### 4. Empty State
When no challenges exist:
- Large Swords icon (faded)
- Helpful message
- "Create Your First Challenge" button

### 5. CTA Section
When challenges exist:
- Gradient background (primary to warning)
- "Ready for More Competition?" heading
- "Challenge a Friend" button

---

## Firestore Schema

### Collection: `challenges`

**Document Structure:**
```
{
  userId: string,              // Current user's ID
  opponentId: string,          // Opponent's user ID
  opponentName: string,        // Opponent's display name
  opponentAvatar: string,      // Opponent's avatar emoji/URL
  habitId: string,             // Associated habit ID
  habitName: string,           // Habit name (e.g., "Morning Workout")
  habitCategory: string,       // Habit category
  status: string,              // 'active' | 'victory' | 'defeated' | 'tied'
  duration: number,            // Total days (7, 14, 30)
  myProgress: number,          // Completed days (0-duration)
  opponentProgress: number,    // Opponent's completed days
  startDate: Timestamp,        // Challenge start date
  endDate: Timestamp,          // Challenge end date
  createdAt: Timestamp,        // Creation timestamp
  updatedAt: Timestamp         // Last update timestamp
}
```

**Indexes Required:**
```
Collection: challenges
- (userId ASC, createdAt DESC)
- (userId ASC, status ASC, createdAt DESC)
```

---

## Real-time Updates

The component uses Firebase's `onSnapshot` to listen for real-time updates:

```typescript
const { challenges, loading } = useChallenges(currentUser?.uid);
```

This automatically updates the UI when:
- New challenges are created
- Progress is updated
- Status changes
- Challenges are deleted

---

## Styling & Design

### Color Coding

**Status Badges:**
- Active: `bg-warning/20 text-warning border-warning/50`
- Victory: `bg-success/20 text-success border-success/50`
- Defeated: `bg-destructive/20 text-destructive border-destructive/50`
- Tied: `bg-primary/20 text-primary border-primary/50`

**Competition Status:**
- Leading: `text-success`
- Behind: `text-warning`
- Tied: `text-primary`

**Icons:**
- Page icon: Swords (primary color)
- Active challenges: Swords (warning color)
- Victories: Trophy (success color)
- Opponents: Users (primary color)
- Timer: Timer icon (muted)

### Responsive Layout

**Desktop (1024px+):**
- Stats: 3 columns
- Challenges: 3 columns grid

**Tablet (768px-1023px):**
- Stats: 3 columns
- Challenges: 2 columns grid

**Mobile (< 768px):**
- Stats: 1 column (stacked)
- Challenges: 1 column (full width)

---

## Usage Example

### Creating a Challenge (TODO - NewChallenge page)
```typescript
await createChallenge(
  currentUser.uid,
  'opponent-user-id',
  'Sarah K.',
  '👩',
  'habit-id-123',
  'Morning Workout',
  'Fitness',
  14 // 14 days
);
```

### Updating Progress (TODO - When habit completed)
```typescript
await updateChallengeProgress(
  challengeId,
  'myProgress',
  currentProgress + 1
);
```

### Checking Status (Automatic)
When a challenge ends (daysLeft === 0), you should:
```typescript
if (myProgress > opponentProgress) {
  await updateChallengeStatus(challengeId, 'victory');
} else if (myProgress < opponentProgress) {
  await updateChallengeStatus(challengeId, 'defeated');
} else {
  await updateChallengeStatus(challengeId, 'tied');
}
```

---

## Integration Points

### 1. Habit Completion Hook
When a user completes a habit, check for active challenges:
```typescript
// In habit completion logic
const activeChallenges = await getChallenges(userId);
const habitChallenges = activeChallenges.filter(
  c => c.habitId === habitId && c.status === 'active'
);

for (const challenge of habitChallenges) {
  await updateChallengeProgress(
    challenge.id,
    'myProgress',
    challenge.myProgress + 1
  );
}
```

### 2. NewChallenge Page (TODO)
Create a form to:
- Select a habit
- Choose an opponent (from friends list)
- Set duration (7, 14, or 30 days)
- Create the challenge

### 3. Notifications (TODO)
Send notifications when:
- Challenge created
- Opponent takes the lead
- Challenge completed
- Daily progress updates

---

## Testing Checklist

- [ ] Page loads without errors
- [ ] Stats display correctly
- [ ] Empty state shows when no challenges
- [ ] Challenge cards display all information
- [ ] Progress bars animate correctly
- [ ] Competition status updates correctly
- [ ] Real-time updates work
- [ ] Navigation to /challenges/new works
- [ ] Responsive design works on all screen sizes
- [ ] Icons display correctly
- [ ] Status badges show correct colors
- [ ] Loading states work properly

---

## Future Enhancements

### Phase 1 (MVP - ✅ Complete)
- [x] Display challenges list
- [x] Show progress bars
- [x] Competition status
- [x] Stats dashboard
- [x] Real-time updates

### Phase 2 (Next Sprint)
- [ ] Create challenge flow (/challenges/new)
- [ ] Delete/cancel challenge
- [ ] Challenge notifications
- [ ] Challenge history
- [ ] Filter by status (active/completed)

### Phase 3 (Future)
- [ ] Challenge leaderboard
- [ ] Challenge rewards/badges
- [ ] Team challenges (3+ people)
- [ ] Challenge chat/comments
- [ ] Challenge sharing on community feed
- [ ] Challenge reminders
- [ ] Challenge analytics

---

## Notes

- Challenges use Firebase Firestore for real-time sync
- Progress updates should happen automatically when habits are completed
- Status updates should be automated based on end date
- Consider adding a cron job to auto-complete challenges
- Opponent data should sync with user profile updates

