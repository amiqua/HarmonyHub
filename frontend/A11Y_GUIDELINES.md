# Accessibility (a11y) Guide - WCAG 2.1 Level AA

## Quick Reference

### ARIA Labels
```jsx
// Good
<button aria-label="Play song">▶️</button>

// Bad
<button>▶️</button>
```

### Semantic HTML
```jsx
// Good
<nav>
  <ul>
    <li><a href="/songs">Songs</a></li>
    <li><a href="/playlists">Playlists</a></li>
  </ul>
</nav>

// Bad
<div className="nav">
  <div><span onClick={...}>Songs</span></div>
</div>
```

## Keyboard Navigation

All interactive elements must be keyboard accessible:

```jsx
// Good - Button is keyboard accessible by default
<button onClick={handlePlay}>Play</button>

// Bad - Div is not keyboard accessible
<div onClick={handlePlay} className="cursor-pointer">Play</div>

// Fix - Add keyboard support to div
<div onClick={handlePlay} onKeyDown={(e) => {
  if (e.key === 'Enter') handlePlay();
}} tabIndex={0} role="button">
  Play
</div>
```

## Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+): Minimum 3:1 contrast ratio

Use tools: https://webaim.org/resources/contrastchecker/

```jsx
// Good - High contrast
<p className="text-gray-900 bg-white">Content</p>

// Bad - Low contrast (would fail WCAG)
<p className="text-gray-500 bg-white">Content</p>
```

## Form Labels

```jsx
// Good
<label htmlFor="email">Email:</label>
<input id="email" type="email" />

// Bad
<input placeholder="Email" />
```

## Images

```jsx
// Good - Descriptive alt text
<img src="cover.jpg" alt="Album cover for 'Dark Side of the Moon' by Pink Floyd" />

// Bad - Missing or vague alt
<img src="cover.jpg" alt="image" />
```

## ARIA Live Regions

For dynamic content updates:

```jsx
function MusicPlayer() {
  const [nowPlaying, setNowPlaying] = useState("");

  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      Now Playing: {nowPlaying}
    </div>
  );
}
```

## Testing

### Automated Testing
```bash
npm install --save-dev @axe-core/react axe-playwright
```

### Manual Testing
1. Keyboard-only navigation (Tab, Enter, Esc)
2. Screen reader testing (NVDA, JAWS, VoiceOver)
3. Zoom to 200% - layout should still work
4. Color contrast verification

### Browser Tools
- axe DevTools
- WAVE
- Lighthouse (built-in Chrome DevTools)

## Common Issues & Fixes

### Issue: Link or button not keyboard accessible
**Fix**: Use semantic `<button>` or `<a>` tags, or add `tabIndex="0"` and `role` to divs

### Issue: Images have no alt text
**Fix**: Add descriptive `alt` attribute to all `<img>` tags

### Issue: Form inputs have no labels
**Fix**: Add `<label htmlFor="id">` associated with input

### Issue: Color only used to convey information
**Fix**: Add text, icons, or patterns alongside color

### Issue: Interactive element is too small
**Fix**: Make buttons/links at least 44x44 pixels

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)

## Checklist

- [ ] All buttons and links have descriptive labels
- [ ] All images have alt text
- [ ] All form inputs have associated labels
- [ ] Color contrast ratio is at least 4.5:1 for normal text
- [ ] Site is fully keyboard navigable
- [ ] Interactive elements are at least 44x44 pixels
- [ ] Videos have captions and transcripts
- [ ] Tables have proper headers
- [ ] Error messages are clearly marked and linked to inputs
- [ ] Focus indicators are visible (not hidden with outline: none)
