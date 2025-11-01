# TalkJS Mount Error Fix

## Issue
Error: `[TalkJS] Cannot mount UI: container element not found`

This error occurs when TalkJS tries to mount the chat UI before the DOM container element is ready.

## Root Causes
1. **Race condition**: TalkJS initialization happening before DOM element is rendered
2. **UseEffect dependency issue**: Including `chatbox` in dependency array caused infinite re-render loop
3. **State-based chatbox reference**: Using state instead of ref caused unnecessary re-renders

## Fixes Applied

### 1. Changed chatbox from state to ref (`frontend/src/pages/Chat.jsx`)
```javascript
// Before:
const [chatbox, setChatbox] = useState(null)

// After:
const chatboxInstance = useRef(null)
```

**Why**: Refs don't trigger re-renders, preventing the chatbox from being destroyed and recreated unnecessarily.

### 2. Fixed useEffect dependency array
```javascript
// Before:
useEffect(() => {
  loadChatData()
  return () => {
    if (chatbox) {
      chatbox.destroy()
    }
  }
}, [matchId, chatbox])  // ❌ chatbox causes re-render loop

// After:
useEffect(() => {
  loadChatData()
  return () => {
    if (chatboxInstance.current) {
      chatboxInstance.current.destroy()
      chatboxInstance.current = null
    }
  }
}, [matchId])  // ✅ Only re-run when matchId changes
```

**Why**: Including `chatbox` in the dependency array caused the effect to re-run every time the chatbox was set, leading to cleanup and re-initialization.

### 3. Added DOM readiness check
```javascript
// Wait for DOM element to be available
if (!chatboxEl.current) {
  console.error('Chat container not found')
  throw new Error('Chat container not found')
}

// Clean up existing chatbox if any
if (chatboxInstance.current) {
  chatboxInstance.current.destroy()
  chatboxInstance.current = null
}
```

**Why**: Ensures the container element exists before attempting to mount TalkJS.

### 4. Added small delay before initialization
```javascript
// Wait a bit for DOM to be fully ready
await new Promise(resolve => setTimeout(resolve, 100))

// Initialize TalkJS
await initializeChat(userData.data, matchData.match)
```

**Why**: Gives React time to render the DOM element before TalkJS tries to mount.

### 5. Proper cleanup
```javascript
// Store in ref instead of state to avoid re-renders
chatboxInstance.current = newChatbox
```

**Why**: Using a ref allows us to maintain a reference to the chatbox without triggering re-renders.

## Testing

After applying these fixes:

1. **Restart the frontend** (if running in dev mode, it should hot reload)
2. Navigate to a match from the Matches page
3. Click on the chat
4. The TalkJS chat should load without the "container element not found" error

## Related Files Modified
- `/Users/jakubnosek/Programming/durhack-2025/frontend/src/pages/Chat.jsx`

## Prevention

To prevent this issue in the future:

1. **Always use refs for DOM elements**: Use `useRef` for storing references to DOM nodes or instances that shouldn't trigger re-renders
2. **Check element existence**: Always verify DOM elements exist before mounting third-party UI components
3. **Proper cleanup**: Always clean up third-party UI components in the useEffect cleanup function
4. **Careful with dependencies**: Only include values in the useEffect dependency array that should trigger the effect to re-run

## Additional Notes

- The TalkJS library itself is working correctly
- The issue was entirely in how React was managing the component lifecycle
- Similar patterns should be used for other chat implementations or third-party UI components

## Next Steps

If you still see the error after these fixes:
1. Clear browser cache and reload
2. Check browser console for any other errors
3. Verify TalkJS App ID is correct in `.env` file
4. Ensure backend is running and accessible
