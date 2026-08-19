import settingsReducer, { setTheme } from '@/store/settings/settingsSlice';

describe('Settings Slice', () => {
  it('should default theme to light', () => {
    const state = settingsReducer(undefined, { type: 'unknown' });
    expect(state.theme).toBe('light');
  });

  it('should handle setTheme', () => {
    const initialState = settingsReducer(undefined, { type: 'unknown' });
    const state = settingsReducer(initialState, setTheme('dark'));
    expect(state.theme).toBe('dark');
  });
});
