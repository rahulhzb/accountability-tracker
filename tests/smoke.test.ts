import { supabase } from '../src/lib/supabase';

describe('project foundation', () => {
  it('runs the Jest test environment', () => {
    expect(true).toBe(true);
  });

  it('imports the Supabase client with test environment variables', () => {
    expect(supabase).toBeDefined();
  });
});
