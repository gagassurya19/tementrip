# Modular Itinerary Generator Structure

## Overview
Aplikasi Itinerary Generator telah dimodularisasi untuk meningkatkan maintainability dan reusability code. Setiap tab telah dipecah menjadi komponen terpisah dengan state management masing-masing.

## File Structure

```
├── app/itinerary/
│   └── page.tsx                     # Main component - orchestrates tabs
├── components/itinerary/
│   ├── manual-itinerary-tab.tsx     # Manual planning tab component
│   ├── ai-itinerary-tab.tsx         # AI generation tab component
│   └── history-itinerary-tab.tsx    # History viewing tab component
├── types/
│   └── itinerary.ts                 # Shared TypeScript interfaces
└── lib/constants/
    └── interests.ts                 # Shared interest options data
```

## Components Overview

### 1. Main Component (`app/itinerary/page.tsx`)
**Responsibilities:**
- Tab state management (`activeTab`)
- Saved itineraries management (localStorage)
- Coordination between tab components
- Header and navigation

**State:**
- `savedItineraries`: Array of saved itineraries
- `activeTab`: Current active tab identifier

**Key Functions:**
- `handleSaveItinerary()`: Adds new itinerary to saved list
- `handleDeleteItinerary()`: Removes itinerary from saved list
- `handleEditItinerary()`: Switches to appropriate tab for editing

### 2. Manual Itinerary Tab (`components/itinerary/manual-itinerary-tab.tsx`)
**Responsibilities:**
- Manual trip planning form
- Destination generation logic
- Map visualization with route planning
- Manual itinerary creation and saving

**State:**
- `manualForm`: Form data for manual planning
- `selectedDestinations`: Generated destinations
- `showMap`: Map visibility toggle
- `showRoute`: Route display toggle
- `isGenerating`: Loading state

**Key Features:**
- Form validation
- Interest-based filtering
- Interactive map with routes
- Destination cards with details

### 3. AI Itinerary Tab (`components/itinerary/ai-itinerary-tab.tsx`)
**Responsibilities:**
- AI-powered itinerary generation form
- API communication with Gemini AI
- AI response display and formatting
- AI itinerary saving

**State:**
- Form data (destination, days, interests, budget, tripType)
- `aiItinerary`: Generated AI response
- `isGenerating`: Loading state for AI generation

**Key Features:**
- Integration with Gemini AI API
- Formatted text output
- Error handling for API failures
- User preference integration

### 4. History Itinerary Tab (`components/itinerary/history-itinerary-tab.tsx`)
**Responsibilities:**
- Display saved itineraries list
- Detailed itinerary viewing
- Edit and delete functionality
- Different rendering for manual vs AI itineraries

**State:**
- `selectedHistoryItinerary`: Currently viewed itinerary
- `showHistoryDetail`: Detail view toggle
- `showRoute`: Route display toggle (for manual itineraries)

**Key Features:**
- List/detail view pattern
- Type-specific rendering (manual vs AI)
- Inline edit/delete actions
- Interactive maps for manual itineraries

## Shared Resources

### Types (`types/itinerary.ts`)
```typescript
interface SavedItinerary {
  id: string
  title: string
  type: 'manual' | 'ai'
  destination: string
  duration: string
  interests: string[]
  budget: string
  tripType: string
  data: any
  createdAt: string
  startDate?: string
  endDate?: string
}
```

### Constants (`lib/constants/interests.ts`)
- Centralized interest options with icons and labels
- Used across all components for consistency

## Benefits of This Structure

### 1. **Separation of Concerns**
- Each tab manages its own state and logic
- Main component focuses on orchestration
- Clear boundaries between features

### 2. **Maintainability**
- Easier to debug specific features
- Isolated changes don't affect other tabs
- Cleaner codebase with smaller files

### 3. **Reusability**
- Components can be reused in other parts of the app
- Shared types ensure consistency
- Constants prevent duplication

### 4. **Testability**
- Each component can be tested in isolation
- Mock props for easier unit testing
- Clear interfaces for integration tests

### 5. **Performance**
- Components only re-render when their specific state changes
- Lazy loading potential for tab components
- Better memory management

## Communication Pattern

```
Main Component
├── Manages global state (savedItineraries)
├── Provides callback props to child components
└── Coordinates tab switching

Child Components
├── Manage their own local state
├── Call parent callbacks for global actions
└── Handle their specific business logic
```

## Future Improvements

1. **State Management**: Consider using Zustand or Redux for complex state
2. **Data Persistence**: Move to database instead of localStorage
3. **Component Composition**: Further break down large components
4. **Error Boundaries**: Add error handling at component level
5. **Loading States**: Implement skeleton loading for better UX

## Usage Examples

### Adding a New Feature
1. Determine which component should handle the feature
2. Add state and functions to the appropriate component
3. Update interfaces if needed
4. Test the component in isolation

### Modifying Shared Data
1. Update the interface in `types/itinerary.ts`
2. Update all components that use the interface
3. Update constants if applicable
4. Test all affected components

This modular structure provides a solid foundation for future development and maintenance of the Itinerary Generator application. 