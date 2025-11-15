# 🔴 REAL-TIME FEATURES - HAVIT

## ✅ Components Using Real-Time Firestore Subscriptions

### 1. **User Data (XP, Level, Profile)**
- **Hook**: `useUserRealtime()` in `hooks/useFirebase.ts`
- **Method**: `onSnapshot()` on Firestore users collection
- **Updates**: Instant XP, level, streak changes
- **Used In**:
  - ✅ Dashboard.tsx
  - ✅ Profile.tsx
  - ✅ XPDisplay.tsx
  - ✅ NewChallengeDialog.tsx
  - ✅ AISageChallenge.tsx

### 2. **Challenges**
- **Hook**: `useChallenges()` in `hooks/useChallenges.ts`
- **Service**: `subscribeToChallenges()` in `services/challengesService.ts`
- **Method**: `onSnapshot()` on Firestore challenges collection
- **Updates**: New challenges, status changes, progress updates
- **Used In**:
  - ✅ ChallengesPage.tsx
  - ✅ ChallengeRequests.tsx

### 3. **Notifications**
- **Service**: `subscribeToNotifications()` in `services/notificationService.ts`
- **Method**: Multiple `onSnapshot()` listeners
  - Pending PvP challenges
  - AI Sage challenge updates
- **Updates**: Instant notification when challenged or AI progress changes
- **Used In**:
  - ✅ NotificationBell.tsx (in navbar)

### 4. **Habits**
- **Hook**: `useHabits()` in `hooks/useFirebase.ts`
- **Method**: `onSnapshot()` via `getHabits()` in `lib/api.ts`
- **Updates**: New habits, completion status, streaks
- **Used In**:
  - ✅ Dashboard.tsx
  - ✅ Habits.tsx
  - ✅ NewChallengeDialog.tsx
  - ✅ AISageChallenge.tsx

## 🔄 Real-Time XP Flow

### Creating a Challenge (PvP)
```
User clicks "New Challenge" → Opens Dialog (no page refresh)
  ↓
Selects opponent, habit, duration, stake
  ↓
Clicks "Create Challenge" → createChallenge() called
  ↓
Two Firestore documents created (reciprocal challenges)
  ↓
onSnapshot triggers → Opponent sees notification INSTANTLY
  ↓
NO XP deducted yet (pending status)
```

### Accepting a Challenge
```
User clicks "Accept" → acceptChallenge() called
  ↓
Firestore updates:
  - Challenge status: 'pending' → 'active'
  - User XP: increment(-stakeXP)
  - Opponent XP: increment(-stakeXP)
  ↓
onSnapshot triggers on users collection
  ↓
XP updates INSTANTLY in:
  - Dashboard (via useUserRealtime)
  - Profile (via useUserRealtime)
  - XPDisplay (via onSnapshot)
  - NotificationBell shows update
  ↓
Challenge appears in "Active" tab INSTANTLY
```

### Completing a Challenge
```
Challenge ends (duration reached) → completeChallenge() called
  ↓
Firestore updates:
  - Winner XP: increment(stakeXP * 2)
  - Challenge status updated
  ↓
onSnapshot triggers
  ↓
Winner's XP updates INSTANTLY everywhere
  ↓
Challenge moves to history
```

### AI Sage Challenge Progress
```
User completes habit → updateAIProgress() called
  ↓
Firestore updates AI opponent progress
  ↓
onSnapshot triggers
  ↓
Progress bars update INSTANTLY
  ↓
If user falls behind → Notification appears INSTANTLY
```

## 📡 Real-Time Indicators

### Visual Feedback
- **RealtimeBadge** component shows "Live" status
- Green badge with WiFi icon when connected
- Pulses every 5 seconds to show active sync
- Red "Offline" badge when disconnected
- **Locations**:
  - Dashboard header
  - Challenges page header

### How It Works
```typescript
// Every component using real-time data
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    // Data updates INSTANTLY when Firestore changes
    setData(snapshot.data());
  });
  
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

## 🎯 What Happens in Real-Time

### Scenario 1: User A challenges User B
1. User A creates challenge → Dialog closes
2. User B's notification bell badge updates **INSTANTLY** (0→1)
3. User B opens notifications → Sees "User A challenged you" **INSTANTLY**
4. User B clicks notification → Goes to Challenges page
5. Challenge appears in "Requests" tab **INSTANTLY**

### Scenario 2: User B accepts challenge
1. User B clicks "Accept" → XP deducted **INSTANTLY**
2. User A's challenges list updates **INSTANTLY** (pending → active)
3. User B's XP in Dashboard decreases **INSTANTLY**
4. User A sees notification "User B accepted!" **INSTANTLY**

### Scenario 3: Daily habit completion affects XP
1. User completes habit → XP rewarded
2. Dashboard XP counter updates **INSTANTLY**
3. Profile page XP updates **INSTANTLY**
4. Level progress bar updates **INSTANTLY**
5. If level up → Thunder animation triggers **INSTANTLY**

### Scenario 4: AI Sage challenge update
1. AI makes daily progress → updateAIProgress() runs
2. Challenge card progress updates **INSTANTLY**
3. If user is behind → Notification appears **INSTANTLY**
4. User can respond **INSTANTLY**

## ⚡ Performance Optimizations

### Firestore Rules
- Indexed queries for fast real-time updates
- Efficient where clauses to minimize data transfer

### React Optimizations
- Unsubscribe on component unmount (prevents memory leaks)
- Debounced searches (300ms delay)
- Local state caching
- Conditional rendering based on loading states

### Network Resilience
- Offline detection (RealtimeBadge)
- Auto-reconnect when back online
- Cached data shown while reconnecting
- Error boundaries for failed subscriptions

## 🔐 Security

All real-time subscriptions respect Firestore security rules:
- Users only see their own challenges
- Users only see public user profiles
- XP changes validated server-side
- Challenge acceptance validates XP availability

## 📊 Monitoring

Real-time status visible via:
- **RealtimeBadge** - Shows connection status
- **Loading states** - Show when data is syncing
- **Error states** - Show when sync fails
- **Console logs** - Debug real-time events

---

**EVERYTHING IS REAL-TIME! 🚀**

No page refreshes needed. No manual syncing. Just instant updates across all devices and users.
