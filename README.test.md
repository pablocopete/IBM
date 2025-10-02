# Automated Testing Guide

This project includes comprehensive automated testing using Vitest and React Testing Library.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Test configuration and global mocks
│   ├── utils/
│   │   └── test-utils.tsx    # Custom render with providers
│   └── mocks/
│       └── mockData.ts       # Reusable mock data
├── components/
│   └── *.test.tsx            # Component tests
├── pages/
│   └── *.test.tsx            # Page tests
└── lib/
    └── *.test.ts             # Utility/library tests
```

## Test Coverage

### Current Test Suites

1. **Authentication Tests** (`src/pages/Auth.test.tsx`)
   - OAuth flow
   - Email/password validation
   - Sign in/sign up functionality
   - Security features display

2. **Consent Dialog Tests** (`src/components/ConsentDialog.test.tsx`)
   - Consent options rendering
   - Database persistence
   - Privacy policy links
   - Accept/decline flows

3. **API Security Tests** (`src/lib/apiSecurity.test.ts`)
   - Request signing
   - Signature verification
   - Timestamp validation
   - Response validation
   - Rate limiting
   - Injection attack prevention

4. **Error Handling Tests** (`src/lib/errorHandling.test.ts`)
   - Rate limit errors
   - Network errors
   - Server errors
   - Fallback data generation

## Writing New Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Testing Best Practices

1. **Use Testing Library queries** in this order:
   - `getByRole` (preferred)
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`
   - `getByTestId` (last resort)

2. **Test user behavior**, not implementation:
   ```typescript
   // ❌ Bad
   expect(component.state.isOpen).toBe(true);
   
   // ✅ Good
   expect(screen.getByRole('dialog')).toBeVisible();
   ```

3. **Use userEvent** instead of fireEvent:
   ```typescript
   // ❌ Bad
   fireEvent.click(button);
   
   // ✅ Good
   const user = userEvent.setup();
   await user.click(button);
   ```

4. **Clean up after tests**:
   - Tests automatically cleanup after each test
   - Mock functions are cleared in `beforeEach`

5. **Mock external dependencies**:
   - Supabase client is mocked globally
   - React Router hooks are mocked
   - Window APIs are stubbed

## Continuous Integration

Add these scripts to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Test Checklist

- [ ] Unit tests for all utility functions
- [ ] Component tests for UI components
- [ ] Integration tests for API calls
- [ ] Security tests for validation
- [ ] Edge function tests (manual for now)
- [ ] E2E tests (to be added)

## Mock Data

Reusable mock data is available in `src/test/mocks/mockData.ts`:

```typescript
import { mockCalendarEvents, mockEmails, mockUser } from '@/test/mocks/mockData';
```

## Debugging Tests

### Run specific test file
```bash
npm test -- Auth.test.tsx
```

### Run tests matching pattern
```bash
npm test -- -t "validates email"
```

### Debug in VS Code
Add this to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## Next Steps

1. Add integration tests for edge functions
2. Add E2E tests with Playwright
3. Set up visual regression testing
4. Configure test coverage thresholds
5. Add performance testing
