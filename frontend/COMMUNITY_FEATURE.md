# Community Feature - Complete Social Media Platform

## Overview
The Community page is a full-featured social media platform integrated into HAVIT, allowing users to share their habit journey, connect with others, and engage through posts, comments, likes, and follows.

## Features Implemented

### 1. Post Creation (`CreatePostBox.tsx`)
- **Text Input**: Rich text area with 500 character limit
- **Real-time Character Counter**: Shows remaining characters
- **Emoji Picker**: Quick random emoji insertion
- **Image Upload**: URL-based image attachment
- **Visibility Settings**:
  - 🌐 Public: Visible to everyone
  - 👥 Friends Only: Visible to followers only
  - 🔒 Private: Visible only to you
- **Auto-hashtag Extraction**: Automatically extracts hashtags from content
- **Toast Notifications**: Success/error feedback

### 2. Post Display (`PostCard.tsx`)
- **Post Header**:
  - User avatar (clickable)
  - Username and timestamp
  - Three-dot menu (Delete/Report/Mute/Block/Copy Link)
- **Post Content**:
  - Text with clickable hashtags (#) and mentions (@)
  - Image attachment display
  - Special post types (Challenge, Achievement, Milestone)
- **Engagement Metrics**:
  - ❤️ Likes with count
  - 💬 Comments with count
  - 📤 Shares with count
- **Action Buttons**:
  - Like (with optimistic UI updates)
  - Comment (toggles comment thread)
  - Share (copies link to clipboard)
  - Bookmark (save for later)
- **Special Post Cards**:
  - Challenge posts with "Join Challenge" button
  - Achievement posts with trophy display
  - Milestone posts with celebration theme

### 3. Comments System (`CommentThread.tsx`)
- **Comment Input**: Text area for adding comments
- **Nested Replies**: 2-level deep comment threads
- **Comment Actions**:
  - Like comments
  - Reply to comments
  - Delete own comments
- **Real-time Updates**: Refresh after posting
- **Empty State**: "Be the first to comment!"

### 4. User Discovery (`UserCard.tsx`)
- **User Information**:
  - Avatar (emoji)
  - Name and username
  - Level and streak display
  - Mutual friends count
- **Follow/Unfollow**:
  - Toggle following status
  - Optimistic UI updates
  - Toast notifications
- **Click Actions**:
  - View user profile (TODO)
  - Follow/unfollow user

### 5. Feed Filtering (`CommunityPage.tsx`)
- **5 Feed Views**:
  - 🌐 All Posts: Public posts from everyone
  - 📰 Following: Posts from people you follow
  - 🔥 Trending: Most liked posts in last 24 hours
  - 💪 Challenges: Challenge-related posts only
  - 🏆 Achievements: Achievement posts only
- **Search Functionality**:
  - Search by hashtag (#fitness)
  - Search by username (@user)
  - Debounced search (300ms)
  - Real-time results

### 6. Sidebar Features
- **Discover Users**: 6-8 random users with follow buttons
- **Trending Challenges**: Top 6 challenges by participant count
- **Trending Hashtags**: Popular hashtags (clickable)
- **Live Activity Feed**: Recent user activities

### 7. Infinite Scroll
- Load 10 posts at a time
- Intersection Observer for auto-loading
- Loading spinner while fetching
- "You've reached the end!" message

## File Structure

```
frontend/src/
├── services/
│   └── communityService.ts          # Firestore operations for community
├── hooks/
│   └── useCommunityFeed.ts          # Custom hooks for community features
├── components/
│   ├── CreatePostBox.tsx            # Post creation component
│   ├── PostCard.tsx                 # Post display component
│   ├── CommentThread.tsx            # Comments system
│   └── UserCard.tsx                 # User discovery card
└── pages/
    └── CommunityPage.tsx            # Main community page
```

## Firestore Schema

### Posts Collection
```typescript
posts/{postId}
  userId: string
  username: string
  userAvatar: string
  content: string
  image?: string
  visibility: 'public' | 'friends' | 'private'
  timestamp: Timestamp
  likes: number
  comments: number
  shares: number
  likedBy: string[]
  hashtags: string[]
  type?: 'normal' | 'challenge' | 'achievement' | 'milestone' | 'collaboration'
  challengeId?: string
  achievementId?: string
```

### Comments Collection
```typescript
comments/{commentId}
  postId: string
  userId: string
  username: string
  userAvatar: string
  content: string
  timestamp: Timestamp
  likes: number
  likedBy: string[]
  replies: string[]
  parentCommentId?: string
```

### Users Collection (Extended)
```typescript
users/{userId}
  ... (existing fields)
  following: string[]        # Array of user IDs
  followers: string[]        # Array of user IDs
```

## Custom Hooks

1. **usePostsFeed** - Fetch and paginate posts
2. **useCreatePost** - Create new posts
3. **useLikePost** - Like/unlike posts
4. **useDeletePost** - Delete own posts
5. **useSharePost** - Share posts (increment counter)
6. **useSearchPosts** - Search posts by hashtag/username
7. **useComments** - Fetch comments for a post
8. **useAddComment** - Add new comments/replies
9. **useReplies** - Load nested replies
10. **useLikeComment** - Like/unlike comments
11. **useDeleteComment** - Delete own comments
12. **useDiscoverUsers** - Fetch random users
13. **useFollowUser** - Follow/unfollow users
14. **useTrendingChallenges** - Get popular challenges
15. **useTrendingHashtags** - Get trending hashtags

## Features to Implement (Future)

### Phase 2 Enhancements
1. **@Mention System**:
   - Autocomplete when typing @
   - Notify mentioned users
   - Clickable mentions to profiles

2. **Image Upload**:
   - Firebase Storage integration
   - Drag-and-drop upload
   - Image compression
   - Multiple image support

3. **Poll System**:
   - Create polls in posts
   - Vote once per user
   - Real-time vote counts
   - Visual progress bars

4. **Notifications**:
   - New follower alerts
   - Comment on post alerts
   - Like alerts
   - Mention alerts
   - Real-time notification badge

5. **User Profiles**:
   - View user profile page
   - See all posts by user
   - Follower/following lists
   - User stats and achievements

6. **Advanced Search**:
   - Full-text search with Algolia
   - Search by keywords
   - Filter by date range
   - Filter by post type

7. **Direct Messages**:
   - Private messaging between users
   - Real-time chat
   - Message notifications

8. **Repost/Quote**:
   - Repost other users' posts
   - Add your own comment to repost
   - Original post attribution

9. **Content Moderation**:
   - Report system
   - Mute/block users
   - Hide posts
   - Admin moderation panel

10. **Analytics**:
    - Post reach and engagement
    - Follower growth
    - Most popular posts
    - Hashtag performance

## Usage

### Navigating to Community
Click "Community" in the sidebar navigation or visit `/community` route.

### Creating a Post
1. Click in the "Share your habit journey..." text area
2. Type your post content (max 500 characters)
3. (Optional) Click emoji button to add random emoji
4. (Optional) Click image button to add image URL
5. Select visibility: Public, Friends Only, or Private
6. Click "Post" button

### Interacting with Posts
- **Like**: Click the heart button
- **Comment**: Click comment button, type comment, click "Comment"
- **Share**: Click share button to copy link
- **Delete**: Click three-dot menu → Delete Post (own posts only)
- **Report**: Click three-dot menu → Report Post

### Following Users
1. Find users in "Discover Users" section
2. Click "Follow" button
3. Button changes to "Following"
4. Click again to unfollow

### Searching
1. Type in search bar at top of sidebar
2. Use hashtag (#fitness) to search by tag
3. Use @ (@username) to search by user
4. Results appear in main feed

### Filtering Feed
Click one of the 5 tabs at top of feed:
- All Posts, Following, Trending, Challenges, Achievements

## Mobile Responsiveness
- **Desktop (1024px+)**: Feed 60% + Sidebar 40%
- **Tablet (768-1023px)**: Feed 65% + Sidebar 35%
- **Mobile (< 768px)**: Full-width feed, sidebar in tabs

## Performance Optimizations
1. **Pagination**: Load 10 posts at a time
2. **Infinite Scroll**: Auto-load on scroll
3. **Optimistic UI**: Instant feedback for likes
4. **Debounced Search**: 300ms delay
5. **Lazy Loading**: Images load as needed
6. **Real-time Listeners**: Clean up on unmount

## Security Considerations

### Firestore Security Rules (To Implement)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'likedBy', 'comments', 'shares'])
      );
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'likedBy'])
      );
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null && (
        request.auth.uid == userId || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['followers', 'following'])
      );
    }
  }
}
```

## Testing Checklist
- [ ] Create a post with text only
- [ ] Create a post with image
- [ ] Create a post with emoji
- [ ] Test all visibility settings
- [ ] Like/unlike a post
- [ ] Comment on a post
- [ ] Reply to a comment
- [ ] Delete own post
- [ ] Delete own comment
- [ ] Search by hashtag
- [ ] Search by username
- [ ] Follow/unfollow a user
- [ ] Switch between feed filters
- [ ] Test infinite scroll
- [ ] Test mobile responsive design
- [ ] Test empty states (no posts, no comments)

## Known Issues / TODO
1. ⚠️ **Firestore Security Rules not set** - All data is currently open
2. ⚠️ **Following feed not fully implemented** - Needs user's friends list query
3. ⚠️ **Hashtag tracking** - Need aggregation for trending hashtags
4. ⚠️ **Habit popularity tracking** - Need aggregation for trending habits
5. ⚠️ **User profile navigation** - Profile page not linked yet
6. ⚠️ **Image storage** - Currently using URLs, need Firebase Storage
7. ⚠️ **Live activity** - Currently static, needs real-time data
8. ⚠️ **Notifications** - Not implemented yet

## Deployment Notes
Before deploying to production:
1. Set Firestore security rules (see Security Considerations)
2. Create Firestore indexes for queries:
   - `posts`: (visibility ASC, timestamp DESC)
   - `posts`: (visibility ASC, type ASC, timestamp DESC)
   - `posts`: (visibility ASC, timestamp DESC, likes DESC)
   - `posts`: (hashtags ARRAY, visibility ASC, timestamp DESC)
   - `comments`: (postId ASC, timestamp DESC)
3. Set up Firebase Storage for image uploads
4. Implement rate limiting for post creation
5. Add content moderation tools
6. Test on various screen sizes
7. Optimize image loading with CDN
