# Contributing to Tone Drone

Thank you for your interest in contributing to Tone Drone! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/tone-drone.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run linter
npm run lint
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode (already configured)
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper cleanup in useEffect hooks (especially for Tone.js objects)
- Prefer named exports for components

### File Organization

- Components go in `src/components/`
- Custom hooks go in `src/hooks/`
- Type definitions go in `src/types/`
- Test files should be colocated with their source files (e.g., `useOscillators.test.ts` next to `useOscillators.ts`)

### Naming Conventions

- Components: PascalCase (e.g., `DroneSynthLite.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useOscillators.ts`)
- Types/Interfaces: PascalCase (e.g., `OscillatorWithChannel.ts`)
- Functions: camelCase (e.g., `updateFrequency`)
- Constants: UPPER_SNAKE_CASE or camelCase depending on scope

## Audio Architecture Patterns

### Tone.js Object Lifecycle

Always dispose of Tone.js objects in useEffect cleanup:

```typescript
useEffect(() => {
  const oscillator = new Tone.Oscillator(440, "sine");
  oscillator.start();

  return () => {
    oscillator.stop();
    oscillator.dispose();
  };
}, []);
```

### Audio Connections

- All audio sources should connect to the main effects bus
- Use `Tone.Channel` for individual volume/pan control
- Use `useConnectChannelsToBus` hook for automatic connection management
- Avoid creating circular audio connections

### State Management

- Use `useState` for UI state that doesn't affect audio
- Use `useRef` for Tone.js objects to avoid unnecessary re-renders
- Use custom hooks to encapsulate audio object creation and management
- Keep audio state separate from UI state when possible

## Testing

### Unit Tests

- Write tests for hooks that manage complex state or audio objects
- Use `@testing-library/react` for component testing
- Mock Tone.js objects when testing components
- Test edge cases and error conditions

### Running Tests

```bash
# Watch mode
npm test

# Single run
npm run test:run

# With UI
npm run test:ui
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass
- [ ] Linter passes with no errors
- [ ] New features include tests
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

### PR Description

Include:

- What changes were made and why
- Any breaking changes
- Screenshots/recordings for UI changes
- Related issue numbers (if applicable)

### Review Process

- Maintainers will review PRs as time permits
- Address review feedback promptly
- Keep PRs focused on a single feature/fix
- Be patient and respectful in discussions

## Feature Requests

- Open an issue to discuss new features before implementing
- Explain the use case and benefit
- Be open to feedback and alternative approaches

## Bug Reports

Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Console errors (if any)
- Audio context state (if relevant)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## Audio Development Tips

### Performance

- Be mindful of audio graph complexity
- Dispose of unused audio objects immediately
- Avoid creating/destroying audio objects in rapid succession
- Use `useCallback` and `useMemo` appropriately for render optimization

### Browser Compatibility

- Test in Chrome, Firefox, and Safari
- Remember that audio context requires user interaction to start
- Be aware of Web Audio API differences across browsers
- Test on mobile devices as well as desktop

### Audio Quality

- Keep the audio graph clean and organized
- Avoid excessive gain staging (watch for clipping)
- Test with headphones and speakers
- Consider CPU usage on lower-end devices

## Questions?

If you have questions that aren't answered here:

- Check existing issues and discussions
- Open a new issue with the "question" label
- Be specific about what you're trying to accomplish

## License

By contributing to Tone Drone, you agree that your contributions will be licensed under the MIT License.

## Acknowledgments

Thank you for taking the time to contribute to Tone Drone!
