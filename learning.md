# Learning Notes

This file explains implementation work in beginner-friendly language. After each implementation task, add a new section that explains the changed files.

## Task 1: Expo And Supabase Foundation

This task created the mobile app foundation: Expo app scaffold, package setup, Supabase client, local development docs, and a smoke test.

### `.env.example`

1. **What is this file for?**  
   Shows which environment variables the app needs without storing real secrets.

2. **Most important lines**  
   `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_EAS_PROJECT_ID`.

3. **Functions/components**  
   None. This is configuration documentation.

4. **Connection to the app**  
   `src/lib/supabase.ts` reads the Supabase URL and anon key from these variables.

5. **What breaks if removed?**  
   New developers will not know which values to put in their local `.env` file.

6. **Mental model**  
   This is the app's empty settings form. Real values go in `.env`; example values stay here.

### `.gitignore`

1. **What is this file for?**  
   Tells git which generated or private files should not be committed.

2. **Most important lines**  
   `node_modules/`, `.expo/`, `.env`, `.env*.local`, `/ios`, and `/android`.

3. **Functions/components**  
   None. Git reads this file directly.

4. **Connection to the app**  
   Keeps dependencies, local Expo cache, native build folders, and private environment values out of version control.

5. **What breaks if removed?**  
   The repo could accidentally commit secrets, huge dependency folders, or generated native build files.

6. **Mental model**  
   This is the repo's trash filter. It says what should stay on your machine and not enter the shared project.

### `.vscode/extensions.json`

1. **What is this file for?**  
   Recommends editor extensions for developers using VS Code.

2. **Most important lines**  
   The `expo.vscode-expo-tools` recommendation.

3. **Functions/components**  
   None. VS Code reads it.

4. **Connection to the app**  
   Helps developers get Expo-specific editor support.

5. **What breaks if removed?**  
   The app still works, but developers lose the automatic extension recommendation.

6. **Mental model**  
   This is a polite editor suggestion.

### `.vscode/settings.json`

1. **What is this file for?**  
   Stores project-level VS Code formatting and code-action behavior.

2. **Most important lines**  
   `source.fixAll`, `source.organizeImports`, and `source.sortMembers` are set to explicit.

3. **Functions/components**  
   None. VS Code reads it.

4. **Connection to the app**  
   Keeps editor automation controlled instead of changing code silently on every save.

5. **What breaks if removed?**  
   The app still works, but editor behavior becomes developer-specific.

6. **Mental model**  
   This is the editor's house rule sheet.

### `AGENTS.md`

1. **What is this file for?**  
   Gives coding agents project-specific instructions.

2. **Most important lines**  
   The instruction to read Expo SDK 54 docs before writing Expo code.

3. **Functions/components**  
   None. Agents read it as guidance.

4. **Connection to the app**  
   Helps future agent work stay aligned with the installed Expo version.

5. **What breaks if removed?**  
   Code still runs, but agents may use stale Expo assumptions.

6. **Mental model**  
   This is the instruction note taped to the repo door.

### `CLAUDE.md`

1. **What is this file for?**  
   Points Claude-style tools to the shared agent instructions.

2. **Most important lines**  
   `@AGENTS.md`.

3. **Functions/components**  
   None. Tooling reads it.

4. **Connection to the app**  
   Keeps Claude-compatible workflows using the same Expo guidance as other agents.

5. **What breaks if removed?**  
   The app still works, but Claude tooling may miss project guidance.

6. **Mental model**  
   This is a signpost to `AGENTS.md`.

### `app.json`

1. **What is this file for?**  
   Stores Expo app configuration.

2. **Most important lines**  
   App name, slug, icons, scheme, supported platforms, and plugin list.

3. **Functions/components**  
   None. Expo reads this file when starting, building, or configuring the app.

4. **Connection to the app**  
   Controls how Expo identifies and packages the mobile app.

5. **What breaks if removed?**  
   Expo may not know how to start or build the project correctly.

6. **Mental model**  
   This is the app's passport.

### `app/_layout.tsx`

1. **What is this file for?**  
   Defines the root layout for Expo Router.

2. **Most important lines**  
   The `Stack` setup, font loading, splash-screen handling, and theme provider.

3. **Functions/components**  
   `RootLayout` loads fonts and returns the app's top-level navigation stack.

4. **Connection to the app**  
   Every screen sits inside this layout.

5. **What breaks if removed?**  
   Navigation and global app setup stop working.

6. **Mental model**  
   This is the app's outer frame.

### `app/(tabs)/_layout.tsx`

1. **What is this file for?**  
   Defines the tab navigation generated by Expo.

2. **Most important lines**  
   The `Tabs` component and each `Tabs.Screen`.

3. **Functions/components**  
   `TabLayout` returns the bottom-tab structure.

4. **Connection to the app**  
   Future screens like Today, Challenges, and Personal will replace or extend these tabs.

5. **What breaks if removed?**  
   The tab screens lose their navigation wrapper.

6. **Mental model**  
   This is the bottom navigation bar controller.

### `app/(tabs)/index.tsx`

1. **What is this file for?**  
   Provides the generated starter home tab.

2. **Most important lines**  
   The `ParallaxScrollView`, `ThemedText`, and starter content.

3. **Functions/components**  
   `HomeScreen` renders the first tab.

4. **Connection to the app**  
   This will become the real Today screen in a later task.

5. **What breaks if removed?**  
   The default home tab has no screen to render.

6. **Mental model**  
   This is a placeholder room that will become the user's daily dashboard.

### `app/(tabs)/explore.tsx`

1. **What is this file for?**  
   Provides the generated starter Explore tab.

2. **Most important lines**  
   The `Collapsible` sections and explanatory starter content.

3. **Functions/components**  
   `TabTwoScreen` renders the second starter tab.

4. **Connection to the app**  
   It is scaffold content and will likely be replaced by challenge or personal tracking screens.

5. **What breaks if removed?**  
   The generated Explore tab route would disappear unless navigation is updated.

6. **Mental model**  
   This is sample furniture from the template.

### `app/modal.tsx`

1. **What is this file for?**  
   Provides a generated modal route.

2. **Most important lines**  
   The `Stack.Screen` options and modal content.

3. **Functions/components**  
   `ModalScreen` renders a simple modal page.

4. **Connection to the app**  
   Shows how modal routes work in Expo Router.

5. **What breaks if removed?**  
   Any link to `/modal` would fail.

6. **Mental model**  
   This is an example pop-up page.

### `components/external-link.tsx`

1. **What is this file for?**  
   Wraps links that open outside the app.

2. **Most important lines**  
   The `ExternalLink` component and platform-specific browser handling.

3. **Functions/components**  
   `ExternalLink` opens links properly, especially on native devices.

4. **Connection to the app**  
   Future docs/help links can reuse this.

5. **What breaks if removed?**  
   Any screen importing `ExternalLink` fails.

6. **Mental model**  
   This is a safe door from the app to the web.

### `components/haptic-tab.tsx`

1. **What is this file for?**  
   Adds haptic feedback to tab presses on supported devices.

2. **Most important lines**  
   The `HapticTab` component and `impactAsync` call.

3. **Functions/components**  
   `HapticTab` behaves like a tab button with a small physical tap response.

4. **Connection to the app**  
   The tab layout can use it for better native feel.

5. **What breaks if removed?**  
   Tabs using this component fail, or haptic feedback disappears if references are removed.

6. **Mental model**  
   This is the tiny vibration layer for tab taps.

### `components/hello-wave.tsx`

1. **What is this file for?**  
   Displays the generated waving-hand animation.

2. **Most important lines**  
   The `useAnimatedStyle` rotation and `withRepeat` animation.

3. **Functions/components**  
   `HelloWave` renders animated starter UI.

4. **Connection to the app**  
   Used by the generated home screen.

5. **What breaks if removed?**  
   The starter home screen import fails.

6. **Mental model**  
   This is a decorative starter animation.

### `components/parallax-scroll-view.tsx`

1. **What is this file for?**  
   Provides a generated scroll view with a parallax header.

2. **Most important lines**  
   The animated header transform and `useScrollViewOffset`.

3. **Functions/components**  
   `ParallaxScrollView` wraps screen content and moves the header as the user scrolls.

4. **Connection to the app**  
   Used by the generated starter screens.

5. **What breaks if removed?**  
   Starter screens importing it fail.

6. **Mental model**  
   This is a scroll container with a moving banner.

### `components/themed-text.tsx`

1. **What is this file for?**  
   Provides text that adapts to light and dark themes.

2. **Most important lines**  
   The `type` variants and `useThemeColor`.

3. **Functions/components**  
   `ThemedText` renders React Native `Text` with shared color and size rules.

4. **Connection to the app**  
   Starter screens use it, and future screens may reuse it for consistent text.

5. **What breaks if removed?**  
   Screens importing `ThemedText` fail.

6. **Mental model**  
   This is normal text with automatic theme clothes.

### `components/themed-view.tsx`

1. **What is this file for?**  
   Provides a view container that adapts to the app theme.

2. **Most important lines**  
   The `useThemeColor` call and returned `View`.

3. **Functions/components**  
   `ThemedView` renders React Native `View` with theme-aware background color.

4. **Connection to the app**  
   Starter screens use it for consistent backgrounds.

5. **What breaks if removed?**  
   Screens importing `ThemedView` fail.

6. **Mental model**  
   This is a box that changes color with the theme.

### `components/ui/collapsible.tsx`

1. **What is this file for?**  
   Provides an expandable/collapsible UI section.

2. **Most important lines**  
   The `isOpen` state and `onPress` toggle.

3. **Functions/components**  
   `Collapsible` shows a title row and reveals children when opened.

4. **Connection to the app**  
   Used by the generated Explore screen.

5. **What breaks if removed?**  
   The Explore screen import fails.

6. **Mental model**  
   This is a drawer that opens and closes.

### `components/ui/icon-symbol.tsx`

1. **What is this file for?**  
   Provides a cross-platform icon wrapper.

2. **Most important lines**  
   The icon mapping and rendered vector icon.

3. **Functions/components**  
   `IconSymbol` renders icons for non-iOS platforms.

4. **Connection to the app**  
   Tab navigation uses icons through this abstraction.

5. **What breaks if removed?**  
   Icon imports fail on platforms that use this file.

6. **Mental model**  
   This is a translator from app icon names to rendered icons.

### `components/ui/icon-symbol.ios.tsx`

1. **What is this file for?**  
   Provides the iOS-specific version of `IconSymbol`.

2. **Most important lines**  
   The mapping to Apple Symbol names.

3. **Functions/components**  
   `IconSymbol` renders native-feeling iOS icons.

4. **Connection to the app**  
   React Native automatically uses this file on iOS.

5. **What breaks if removed?**  
   iOS may fall back to the generic icon file or lose intended native icon behavior.

6. **Mental model**  
   This is the iPhone-specific icon translator.

### `constants/theme.ts`

1. **What is this file for?**  
   Defines shared light and dark theme colors.

2. **Most important lines**  
   The `Colors` object.

3. **Functions/components**  
   None. Components import its constants.

4. **Connection to the app**  
   `ThemedText`, `ThemedView`, and tabs use these colors.

5. **What breaks if removed?**  
   Theme-dependent imports fail.

6. **Mental model**  
   This is the app's starter color palette.

### `docs/runbooks/local-development.md`

1. **What is this file for?**  
   Explains how to run the project locally.

2. **Most important lines**  
   Required accounts, `.env` setup, `npm start`, `npm test`, and Supabase CLI command.

3. **Functions/components**  
   None. This is human-facing documentation.

4. **Connection to the app**  
   Helps future contributors start the project without reverse-engineering setup.

5. **What breaks if removed?**  
   The app still runs, but onboarding new developers gets slower.

6. **Mental model**  
   This is the local setup recipe.

### `eslint.config.js`

1. **What is this file for?**  
   Configures linting rules for the Expo project.

2. **Most important lines**  
   `eslint-config-expo` and ignored `dist`.

3. **Functions/components**  
   None. ESLint reads it.

4. **Connection to the app**  
   `expo lint` uses this to check code quality.

5. **What breaks if removed?**  
   Linting may stop or use wrong defaults.

6. **Mental model**  
   This is the code style rulebook.

### `hooks/use-color-scheme.ts`

1. **What is this file for?**  
   Gets the user's current light/dark mode setting.

2. **Most important lines**  
   The exported `useColorScheme`.

3. **Functions/components**  
   `useColorScheme` wraps React Native's color scheme hook.

4. **Connection to the app**  
   Theme-aware components use it to pick colors.

5. **What breaks if removed?**  
   Theme imports fail.

6. **Mental model**  
   This asks the phone whether it is in light mode or dark mode.

### `hooks/use-color-scheme.web.ts`

1. **What is this file for?**  
   Web-specific version of the color-scheme hook.

2. **Most important lines**  
   The exported `useColorScheme`.

3. **Functions/components**  
   `useColorScheme` handles web behavior separately when needed.

4. **Connection to the app**  
   React Native Web chooses this file for web builds.

5. **What breaks if removed?**  
   Web behavior may fall back to the native hook or break depending on imports.

6. **Mental model**  
   This is the browser version of the light/dark mode detector.

### `hooks/use-theme-color.ts`

1. **What is this file for?**  
   Chooses a color based on the current theme.

2. **Most important lines**  
   The `useThemeColor` function and `Colors[colorName]` lookup.

3. **Functions/components**  
   `useThemeColor` returns the right color for light or dark mode.

4. **Connection to the app**  
   `ThemedText` and `ThemedView` use it.

5. **What breaks if removed?**  
   Theme-aware components fail.

6. **Mental model**  
   This is a color picker that checks the theme first.

### `jest.setup.ts`

1. **What is this file for?**  
   Prepares the test environment before tests run.

2. **Most important lines**  
   The dummy `EXPO_PUBLIC_*` values and AsyncStorage Jest mock.

3. **Functions/components**  
   It does not export functions. Jest runs it automatically through `package.json`.

4. **Connection to the app**  
   Allows tests to import `src/lib/supabase.ts` without real secrets or native AsyncStorage.

5. **What breaks if removed?**  
   Tests importing the Supabase client fail because env vars or AsyncStorage are missing.

6. **Mental model**  
   This is the fake test-world setup.

### `package.json`

1. **What is this file for?**  
   Declares app scripts and dependencies.

2. **Most important lines**  
   `main`, `scripts`, `dependencies`, `devDependencies`, and `jest`.

3. **Functions/components**  
   None directly. Package managers and tools read it.

4. **Connection to the app**  
   Expo, Jest, TypeScript, Supabase, and React Native dependencies are all declared here.

5. **What breaks if removed?**  
   The project cannot install dependencies or run standard commands.

6. **Mental model**  
   This is the app's toolbox inventory.

### `package-lock.json`

1. **What is this file for?**  
   Locks exact dependency versions installed by npm.

2. **Most important lines**  
   The resolved package versions under `packages`.

3. **Functions/components**  
   None. npm reads it.

4. **Connection to the app**  
   Makes installs reproducible across machines and CI.

5. **What breaks if removed?**  
   Installs can drift to slightly different versions.

6. **Mental model**  
   This is the exact receipt for the toolbox.

### `scripts/reset-project.js`

1. **What is this file for?**  
   Expo template helper that resets starter app files.

2. **Most important lines**  
   File-moving and cleanup logic for starter routes.

3. **Functions/components**  
   It is a Node script, not app runtime code.

4. **Connection to the app**  
   Called by the `reset-project` package script if we want to clean the starter template.

5. **What breaks if removed?**  
   `npm run reset-project` stops working.

6. **Mental model**  
   This is a broom for clearing starter template content.

### `src/lib/supabase.ts`

1. **What is this file for?**  
   Creates the app's Supabase client.

2. **Most important lines**  
   Env var reads, missing-env `throw`, `createClient`, `AsyncStorage`, `processLock`, and `AppState` auto-refresh.

3. **Functions/components**  
   It exports `supabase`, the shared client used for auth and database calls.

4. **Connection to the app**  
   Future auth, challenge, goal, check-in, feed, and notification APIs will import this client.

5. **What breaks if removed?**  
   The app loses its backend connection.

6. **Mental model**  
   This is the app's phone line to Supabase.

### `tests/smoke.test.ts`

1. **What is this file for?**  
   Confirms the test runner works and the Supabase client can be imported in tests.

2. **Most important lines**  
   The `supabase` import and the two `expect` checks.

3. **Functions/components**  
   The test cases verify the Jest environment and Supabase client import.

4. **Connection to the app**  
   Protects the foundation so later tests do not start from a broken setup.

5. **What breaks if removed?**  
   Tests may still run later, but we lose this early warning check.

6. **Mental model**  
   This is a small alarm that confirms the workshop lights turn on.

### `tsconfig.json`

1. **What is this file for?**  
   Configures TypeScript for the Expo app.

2. **Most important lines**  
   The Expo base config and path alias.

3. **Functions/components**  
   None. TypeScript reads it.

4. **Connection to the app**  
   Controls how TypeScript understands app files and imports.

5. **What breaks if removed?**  
   Type checking and editor TypeScript support may break.

6. **Mental model**  
   This is the TypeScript map of the project.

### `assets/images/*`

Changed files:

- `android-icon-background.png`
- `android-icon-foreground.png`
- `android-icon-monochrome.png`
- `favicon.png`
- `icon.png`
- `partial-react-logo.png`
- `react-logo.png`
- `react-logo@2x.png`
- `react-logo@3x.png`
- `splash-icon.png`

1. **What are these files for?**  
   They are generated starter image assets for icons, splash screens, and template UI.

2. **Most important lines**  
   These are binary images, so there are no code lines.

3. **Functions/components**  
   None.

4. **Connection to the app**  
   `app.json` and starter screens reference them.

5. **What breaks if removed?**  
   Icons, splash screens, or starter screen images may fail to load.

6. **Mental model**  
   These are the app's starter pictures and badges.

## Task 2: Supabase Schema And Security Model

This task created the database blueprint for the MVP and documented how private data stays private.

### `supabase/migrations/0001_initial_schema.sql`

1. **What is this file for?**
   It tells Supabase/Postgres how to create the app's database tables, relationships, indexes, and row-level security rules.

2. **Most important lines**
   The `create table` blocks define the main app objects: `profiles`, `challenges`, `challenge_members`, `goals`, `check_ins`, `feed_events`, `comments`, and `device_tokens`. The `invite_code` check requires an uppercase 8-16 character code so invite links have a predictable safe shape. The `alter table ... enable row level security` lines turn on database-level privacy. The `create policy` lines define who can read or write each row.

3. **Functions/components**
   `public.is_challenge_member(target_challenge_id uuid)` answers "is the signed-in user a member of this challenge?" and is reused by many RLS policies. `public.join_challenge_by_invite_code(target_invite_code text)` lets a signed-in user join a private challenge by invite code without allowing unsafe direct membership inserts by guessed challenge ID. The `feed member insert consistent checkin event` policy lets app code create feed events only when the event is tied to the signed-in user's own check-in and challenge.

4. **Connection to the app**
   Future auth, challenge, goal, check-in, feed, comment, and notification code will read and write these tables through the Supabase client in `src/lib/supabase.ts`.

5. **What breaks if removed?**
   The app has no backend data model. Screens might render, but users could not safely store profiles, challenges, goals, check-ins, comments, or push tokens.

6. **Mental model**
   This is the locked filing cabinet for the app. Tables are drawers, foreign keys connect related folders, and RLS policies are the locks that only open for the right user.

### `docs/runbooks/security.md`

1. **What is this file for?**
   It explains the app's security model in plain language for developers and operators.

2. **Most important lines**
   The "Data Boundaries" section explains which data is private to a user and which data is shared with challenge members. The "Critical Direct-Object-Reference Checks" section lists the main bugs we must avoid, like reading another user's personal goals or joining a challenge by guessed ID.

3. **Functions/components**
   No code functions live here. It references the database function `public.join_challenge_by_invite_code(invite_code)` so future challenge-join code uses the safe path.

4. **Connection to the app**
   Future features should match this document when they query Supabase. If app code tries to bypass these rules, RLS should reject it.

5. **What breaks if removed?**
   The database still works, but future developers lose the simple explanation of the privacy rules and may accidentally design unsafe flows.

6. **Mental model**
   This is the safety checklist next to the database. Before adding a feature, read it and ask whether the current user should really see or change that row.

### `tests/rls.test.ts`

1. **What is this file for?**
   It checks the migration text for the most important RLS rules without needing Docker or a live Supabase database.

2. **Most important lines**
   `readFileSync(migrationPath, 'utf8')` loads the SQL migration. `policySql(policyName)` extracts one policy at a time so the tests do not accidentally pass because of an unrelated line elsewhere. The tests check that every app table enables RLS, challenge reads require membership, personal goals stay owner-only, feed reads require membership, direct membership self-join is not allowed, invite codes are normalized, check-ins require goal ownership, feed inserts require a real check-in owned by the user, and comments/device tokens stay inside the authenticated user's boundary.

3. **Functions/components**
   `normalizedSql()` makes SQL spacing easier to test by collapsing whitespace and lowercasing the file. `policySql()` narrows checks to a single policy body. Each `it(...)` block is a Jest test for one security expectation.

4. **Connection to the app**
   These tests protect the database contract that future app screens and API helpers depend on.

5. **What breaks if removed?**
   A future migration edit could accidentally weaken RLS and the normal Jest suite would not catch the missing security rule.

6. **Mental model**
   This is a smoke alarm for the database locks. It does not open a real Supabase instance, but it warns us if the lock instructions disappear from the migration.

## Task 3: Date And Deadline Logic

This task added small timezone helpers that future check-in and missed-deadline code can share.

### `src/lib/dates.ts`

1. **What is this file for?**
   It turns an exact moment in time into the user's local date and checks whether a configurable local deadline has already passed.

2. **Most important lines**
   The `Intl.DateTimeFormat` setup asks JavaScript to describe a `Date` in a specific timezone instead of the device's default timezone. `assertValidDate` and the timezone error handling turn low-level JavaScript errors into app-level errors. `getLocalDateKey` returns a `YYYY-MM-DD` string for database fields like `local_date`. `hasDeadlinePassedForLocalDate` first compares the local calendar date, then compares seconds since local midnight only when the target date is today.

3. **Functions/components**
   `getLocalDateKey(date, timeZone)` answers "what calendar day is this for the user?" `hasDeadlinePassed(now, deadlineTime, timeZone)` answers "has today's local deadline passed?" `hasDeadlinePassedForLocalDate(now, localDate, deadlineTime, timeZone)` answers "has the deadline for this specific local date passed?" `parseDeadlineTime(deadlineTime)` accepts `HH:mm` or `HH:mm:ss` in 24-hour time and rejects invalid values like `9pm`. `assertValidDate` and `assertValidLocalDate` stop bad inputs before they can confuse deadline logic.

4. **Connection to the app**
   Future check-in screens can use `getLocalDateKey` when saving today's check-in. Future reminder flows can use `hasDeadlinePassed` for today's reminder. Future missed-check-in jobs should use `hasDeadlinePassedForLocalDate` because missed jobs often evaluate goals from prior local dates, not only today.

5. **What breaks if removed?**
   The app may save check-ins under the wrong day for users outside UTC, and deadline automation may mark goals missed too early or too late.

6. **Mental model**
   This file is the app's timezone translator. It looks at one global clock moment and tells the app what that moment means on the user's local calendar.

### `tests/dates.test.ts`

1. **What is this file for?**
   It proves the date helpers work before other features depend on them.

2. **Most important lines**
   The first import points at `../src/lib/dates`, which intentionally failed before `src/lib/dates.ts` existed. The timezone-difference test checks that the same UTC moment can be May 19 in Kolkata but May 18 in Los Angeles. The prior-date and future-date tests protect missed-check-in automation from comparing only the clock time. The invalid timezone, invalid date, and invalid local date tests protect the helper's error contract.

3. **Functions/components**
   Each `it(...)` block is a Jest test for one behavior: local date keys, timezone differences, passed deadlines, future deadlines, exact deadline seconds, short deadline strings, specific local-date deadlines, and invalid inputs.

4. **Connection to the app**
   These tests guard the shared date contract used by future check-in, feed, and missed-check-in code.

5. **What breaks if removed?**
   Future edits could accidentally fall back to UTC or compare deadline text incorrectly without the test suite catching it.

6. **Mental model**
   This file is the practice course for the timezone translator. It checks normal paths and tricky boundary paths before the helpers are used in real app flows.

## Task 4: Auth And Profile Flow

This task added the first real authentication flow: Supabase session tracking, a sign-in/create-account screen, and root navigation that sends signed-out users to auth.

### `src/features/auth/auth-context.tsx`

1. **What is this file for?**
   It gives the whole app one shared place to ask "is someone signed in right now?"

2. **Most important lines**
   `createContext<AuthContextValue>({ session: null, loading: true })` creates the shared auth state. `supabase.auth.getSession()` loads any saved session when the app starts. `supabase.auth.onAuthStateChange(...)` keeps the app updated when the user signs in or signs out. `data.subscription.unsubscribe()` cleans up the listener when the provider unmounts.

3. **Functions/components**
   `AuthProvider` wraps the app and owns the `session` and `loading` state. `useAuth()` is the small helper hook screens can call to read that state without passing props through every component.

4. **Connection to the app**
   `app/_layout.tsx` wraps navigation in `AuthProvider`, so future screens can call `useAuth()` to know the current user before querying private Supabase rows.

5. **What breaks if removed?**
   The app would not know whether a user is signed in, and route protection would not have a reliable session source.

6. **Mental model**
   This file is the app's front desk. Every screen can ask the front desk who is currently checked in.

### `app/_layout.tsx`

1. **What is this file for?**
   It is the root navigation shell for the Expo app.

2. **Most important lines**
   `<AuthProvider>` makes auth state available to the router. `RootStack` reads `session`, `loading`, and `segments`. The first `<Redirect href="/(auth)/sign-in" />` sends signed-out users to the sign-in screen. The second redirect sends signed-in users away from auth and back to the app tabs.

3. **Functions/components**
   `RootLayout` keeps the existing theme and status bar setup. `RootStack` decides which route group should be visible based on auth state.

4. **Connection to the app**
   Every screen passes through this layout first, so this is where auth protection belongs before challenge, goal, feed, and check-in screens are added.

5. **What breaks if removed?**
   The app could render private tabs before knowing whether the user has a valid Supabase session.

6. **Mental model**
   This file is the building entrance. If you are not signed in, it points you to the lobby. If you are signed in, it lets you into the app.

### `app/(auth)/sign-in.tsx`

1. **What is this file for?**
   It renders the email/password screen for signing in or creating an account.

2. **Most important lines**
   `useState` stores the typed email, password, and loading state. `supabase.auth.signInWithPassword({ email, password })` signs in an existing user. `supabase.auth.signUp({ email, password })` creates a new account. `Alert.alert(...)` shows errors or the email-confirmation message.

3. **Functions/components**
   `SignInScreen` renders the form. `signIn()` sends the sign-in request to Supabase. `signUp()` sends the create-account request to Supabase and asks the user to confirm their email.

4. **Connection to the app**
   The route guard in `app/_layout.tsx` sends signed-out users here. When Supabase reports a successful sign-in, `AuthProvider` receives the session update and navigation can move into the main app.

5. **What breaks if removed?**
   Signed-out users would have nowhere to enter credentials or create an account.

6. **Mental model**
   This file is the login form at the front door. It collects credentials and hands them to Supabase.

### `tests/auth-context.test.tsx`

1. **What is this file for?**
   It proves the auth provider loads and updates Supabase session state.

2. **Most important lines**
   The mocked `getSession` returns a fake saved session. The mocked `onAuthStateChange` captures Supabase's callback so the test can simulate a sign-in event.

3. **Functions/components**
   `wrapper` renders hooks inside `AuthProvider`. The first test checks startup session loading. The second test checks live session updates from Supabase.

4. **Connection to the app**
   These tests protect the auth state contract used by route guards and future private screens.

5. **What breaks if removed?**
   A future auth refactor could stop loading saved sessions or stop responding to sign-in events without the test suite catching it.

6. **Mental model**
   This file is a practice Supabase auth server. It sends fake auth events and checks whether the app listens correctly.

### `tests/sign-in.test.tsx`

1. **What is this file for?**
   It proves the sign-in screen sends the user's email and password to the correct Supabase auth methods.

2. **Most important lines**
   `fireEvent.changeText(...)` simulates typing into the form. `fireEvent.press(...)` simulates tapping a button. The expectations check that Supabase receives the exact email and password from the screen.

3. **Functions/components**
   The first test covers existing-user sign-in. The second test covers new-account creation and the email-confirmation alert.

4. **Connection to the app**
   These tests protect the first user-facing auth screen before onboarding, profiles, and invite flows depend on signed-in users.

5. **What breaks if removed?**
   The sign-in form could stop calling Supabase correctly and tests would not catch the broken login path.

6. **Mental model**
   This file is a robot user that types credentials, presses buttons, and checks which Supabase doorbell rang.

## Task 5: Challenge Creation And Invite Join

This task added the first invite-only group loop: users can create a private challenge, see their challenges, join a friend group by invite code, and open a placeholder challenge detail screen.

### `src/features/challenges/api.ts`

1. **What is this file for?**
   It contains the Supabase calls for challenge groups, so screens do not need to know table names or RPC details.

2. **Most important lines**
   `createChallenge(...)` calls `create_private_challenge`, so challenge creation and owner membership happen together in the database. `listMyChallenges()` selects the challenges the current user can see through RLS. `joinChallengeByInvite(...)` calls `join_challenge_by_invite_code`, which is safer than directly selecting by invite code because the database function handles private invite joining.

3. **Functions/components**
   `inviteCode()` creates an 8-character uppercase invite code. `normalizeInviteCode(code)` trims and uppercases friend-shared invite codes. `createChallenge` creates the group through an atomic database function. `listMyChallenges` loads groups for the challenge tab. `joinChallengeByInvite` joins an existing private group through the secure database function.

4. **Connection to the app**
   `app/challenges/new.tsx` uses `createChallenge`. `app/(tabs)/challenges.tsx` uses `listMyChallenges` and `joinChallengeByInvite`.

5. **What breaks if removed?**
   Challenge screens would have no shared way to create, list, or join groups.

6. **Mental model**
   This file is the challenge service desk. Screens ask it to create a room, list rooms, or enter a room with an invite code.

### `app/(tabs)/challenges.tsx`

1. **What is this file for?**
   It is the main Challenges tab where a user sees existing friend groups and joins a group by invite code.

2. **Most important lines**
   `useFocusEffect(...)` loads groups whenever the tab becomes active. `joinChallenge()` validates the invite code, calls the API, and routes to the joined challenge. `FlatList` renders the user's challenge rows.

3. **Functions/components**
   `ChallengesScreen` owns the list, invite-code input, and loading states. `loadChallenges()` fetches visible groups and avoids setting state after the screen is no longer active. `joinChallenge()` joins a group and navigates to its detail route.

4. **Connection to the app**
   `app/(tabs)/_layout.tsx` exposes this screen as a tab. It depends on the challenge API and routes into `app/challenges/[challengeId].tsx`.

5. **What breaks if removed?**
   Users would not have a central place to find or join challenge groups.

6. **Mental model**
   This file is the user's group lobby. It shows rooms they belong to and lets them enter a new room with a code.

### `app/challenges/new.tsx`

1. **What is this file for?**
   It renders the form for creating a new private challenge group.

2. **Most important lines**
   `useAuth()` confirms there is a signed-in user before creation. `createChallenge({ description, name })` creates the group, while the database uses `auth.uid()` as the owner. `router.push(...)` sends the user to the new challenge after creation.

3. **Functions/components**
   `NewChallengeScreen` renders the name and description fields. `submit()` validates sign-in and challenge name, calls the API, and handles success or error alerts.

4. **Connection to the app**
   The Challenges tab links here through `/challenges/new`. The created challenge becomes part of the same data model that future goals and check-ins attach to.

5. **What breaks if removed?**
   Users could join existing groups but could not start their own friend group.

6. **Mental model**
   This file is the room builder. The user gives the room a name and the app creates a private space with an invite code.

### `app/challenges/[challengeId].tsx`

1. **What is this file for?**
   It is the placeholder detail page for one challenge.

2. **Most important lines**
   `useLocalSearchParams<{ challengeId: string }>()` reads the challenge ID from the route. The body text makes clear that goals, members, check-ins, and feed activity will connect here in later tasks.

3. **Functions/components**
   `ChallengeDetailScreen` renders the current challenge route ID and sets up the place where the challenge experience will grow.

4. **Connection to the app**
   Create and join flows route here after success. Later tasks will replace the placeholder with challenge goals, members, feed, and check-ins.

5. **What breaks if removed?**
   Successful create/join flows would route to a missing screen.

6. **Mental model**
   This file is an empty room with the room number on the wall. Later tasks will add furniture.

### `app/(tabs)/_layout.tsx`

1. **What is this file for?**
   It defines which screens appear in the bottom tab bar.

2. **Most important lines**
   The new `Tabs.Screen` with `name="challenges"` registers the Challenges tab. Its icon uses `person.3.fill` to represent friend groups.

3. **Functions/components**
   `TabLayout` returns the tab navigator. Each `Tabs.Screen` entry adds one tab.

4. **Connection to the app**
   This makes `app/(tabs)/challenges.tsx` reachable from the main signed-in navigation.

5. **What breaks if removed?**
   The Challenges screen file could exist, but users would not see it in the tab bar.

6. **Mental model**
   This file is the app's bottom menu. Adding a screen here adds another button to that menu.

### `app/_layout.tsx`

1. **What is this file for?**
   It is the root navigation shell for the Expo app.

2. **Most important lines**
   The new `Stack.Screen` entries for `challenges/[challengeId]` and `challenges/new` register the challenge detail and create screens with titles.

3. **Functions/components**
   `RootStack` still handles auth redirects and now also knows about challenge routes outside the tab group.

4. **Connection to the app**
   This lets create/join flows navigate to `/challenges/new` and `/challenges/:challengeId`.

5. **What breaks if removed?**
   Challenge routes may still exist on disk, but the root stack would not provide their intended navigation headers.

6. **Mental model**
   This file is the building map. The Task 5 change adds two new rooms to the map.

### `components/ui/icon-symbol.tsx`

1. **What is this file for?**
   It maps iOS SF Symbol names to Material Icons for Android and web.

2. **Most important lines**
   `'person.3.fill': 'groups'` teaches Android/web how to render the new Challenges tab icon.

3. **Functions/components**
   `IconSymbol` receives a symbol-style name and renders the matching Material Icon fallback outside iOS.

4. **Connection to the app**
   `app/(tabs)/_layout.tsx` uses `IconSymbol` for the Challenges tab icon.

5. **What breaks if removed?**
   Android/web could render an undefined icon name for the Challenges tab.

6. **Mental model**
   This file is an icon dictionary. iOS and Android speak different icon languages, so this translates between them.

### `tests/challenges-api.test.ts`

1. **What is this file for?**
   It proves the challenge API talks to Supabase using the expected tables and secure RPC.

2. **Most important lines**
   The create test checks trimmed name/description, invite-code shape, and the atomic `create_private_challenge` RPC. The join test checks that invite joining uses `join_challenge_by_invite_code`.

3. **Functions/components**
   Each test mocks Supabase's client and verifies one API behavior: create, list, or join.

4. **Connection to the app**
   These tests protect the data layer used by challenge screens.

5. **What breaks if removed?**
   A future change could accidentally split challenge creation back into two client writes or join by direct invite-code lookup without tests catching it.

6. **Mental model**
   This file is a fake Supabase counter. It watches which database window the API walks up to.

### `supabase/migrations/0001_initial_schema.sql`

1. **What is this file for?**
   It defines the database schema, privacy rules, and safe database functions for the app.

2. **Most important lines**
   `create_private_challenge(...)` creates a profile if needed, inserts the challenge, and inserts the creator as owner in one database transaction. `join_challenge_by_invite_code(...)` also creates a profile if needed before adding membership. Both functions use `auth.uid()` so the client cannot pretend to be another user.

3. **Functions/components**
   `create_private_challenge` is the safe challenge creation path. `join_challenge_by_invite_code` is the safe invite join path. The profile bootstrap inserts `auth.uid()` with a display name derived from the email prefix or `Friend`.

4. **Connection to the app**
   `src/features/challenges/api.ts` calls these functions. The screens get simpler because the database handles the multi-row safety rules.

5. **What breaks if removed?**
   New users may fail to create or join challenges because they might not have a `profiles` row yet. Challenge creation could also leave behind a group without owner membership if split into separate client writes.

6. **Mental model**
   This migration is the locked room builder. It creates the user's badge, creates the room, and makes the user the owner before handing the room back to the app.

### `tests/rls.test.ts`

1. **What is this file for?**
   It checks the SQL migration text for the privacy and safety rules the app relies on.

2. **Most important lines**
   The new challenge function test checks that `create_private_challenge` inserts both `challenges` and `challenge_members`. The invite join bootstrap test checks that joining can create a missing profile and uses `on conflict (id) do nothing`.

3. **Functions/components**
   `normalizedSql()` makes SQL text comparisons consistent. The new `it(...)` blocks protect the database function contracts added for Task 5.

4. **Connection to the app**
   These tests protect the Supabase functions called by `src/features/challenges/api.ts`.

5. **What breaks if removed?**
   A future migration edit could remove profile bootstrap or atomic challenge creation without normal UI tests catching the database-level regression.

6. **Mental model**
   This file is a database rule inspector. It reads the lock instructions and confirms the important locks are still written down.

### `tests/challenges-screens.test.tsx`

1. **What is this file for?**
   It proves the challenge screens call the right APIs when a user creates or joins a group.

2. **Most important lines**
   `fireEvent.changeText(...)` fills form inputs. `fireEvent.press(...)` taps buttons. The expectations check the exact API input and navigation path.

3. **Functions/components**
   The first test covers creating a challenge from the new screen. The second test covers loading challenges and joining by invite code from the tab.

4. **Connection to the app**
   These tests protect the first complete challenge loop before goals and check-ins are added.

5. **What breaks if removed?**
   The UI could stop passing the challenge form values, invite code, or route target correctly without the test suite catching it.

6. **Mental model**
   This file is a robot friend. It opens the challenge screens, types into forms, taps buttons, and checks that the app goes to the right room.

## Task 6: Goals And Daily Check-Ins

This task added the personal tracker loop: users can create daily personal goals, see active goals, and submit one daily check-in as done or skipped with an optional note.

### `src/features/goals/api.ts`

1. **What is this file for?**
   It contains the Supabase calls for creating and listing goals.

2. **Most important lines**
   `createGoal(...)` calls the `create_goal` database function instead of inserting directly. This lets the database create a missing profile row and use `auth.uid()` as the real owner. `listActiveGoals(userId)` loads active goals for the current user, ordered newest first.

3. **Functions/components**
   `createGoal` creates a personal or challenge goal. `listActiveGoals` fetches goals with `status = active`.

4. **Connection to the app**
   `app/(tabs)/personal.tsx` uses this API to add personal goals and refresh the goal list.

5. **What breaks if removed?**
   The personal tracker screen would have no shared way to create or load goals.

6. **Mental model**
   This file is the goal service desk. Screens ask it to create a goal or show the user's current goal list.

### `src/features/check-ins/api.ts`

1. **What is this file for?**
   It contains the Supabase call for submitting today's check-in.

2. **Most important lines**
   `getLocalDateKey(now, input.timezone)` computes the user's local day. `.upsert(..., { onConflict: 'goal_id,local_date' })` ensures one check-in per goal per local date. `note: input.note.trim() || null` stores blank notes as `null`.

3. **Functions/components**
   `submitCheckIn` creates or replaces today's check-in for a goal. It supports `done` and `skipped`; future automation will add `missed`.

4. **Connection to the app**
   `app/check-ins/[goalId].tsx` uses this API when the user taps `Mark done` or `Skip today`.

5. **What breaks if removed?**
   Users could create goals but could not report whether they kept today's commitment.

6. **Mental model**
   This file is the daily attendance sheet. It records one status for each goal on each local day.

### `app/(tabs)/personal.tsx`

1. **What is this file for?**
   It is the personal tracker tab for goals that are not tied to a friend group.

2. **Most important lines**
   `useFocusEffect(...)` reloads goals when the tab becomes active. `createGoal({ challengeId: null, ... })` creates a personal goal. The typed `router.push({ pathname: '/check-ins/[goalId]', params: ... })` opens the check-in screen and passes the goal's stored timezone.

3. **Functions/components**
   `PersonalScreen` renders the add-goal form and active goal list. `loadGoals` fetches active goals for the signed-in user. `addGoal` validates the title, creates the goal, clears the input, and reloads the list. The check-in button passes both `goalId` and `timezone` so the check-in date matches the goal's timezone, not just the device timezone.

4. **Connection to the app**
   `app/(tabs)/_layout.tsx` exposes this as the `Personal` tab. It connects auth state, goal creation, goal listing, and check-in navigation.

5. **What breaks if removed?**
   Users would not have a place to create or manage their own personal goals.

6. **Mental model**
   This file is the user's private checklist. Add a daily promise at the top, then check in from the list below.

### `app/check-ins/[goalId].tsx`

1. **What is this file for?**
   It is the screen for submitting today's check-in for one goal.

2. **Most important lines**
   `useLocalSearchParams` reads the `goalId` and goal `timezone` from the route. `submit('done')` and `submit('skipped')` send the selected status to `submitCheckIn`. `router.back()` returns to the previous screen after a successful check-in.

3. **Functions/components**
   `CheckInScreen` renders the note box and status buttons. `submit` validates sign-in, goal ID, and timezone, calls the API, and handles errors.

4. **Connection to the app**
   The personal tracker routes here with `/check-ins/:goalId` and includes the goal timezone as a route param. Later challenge goal screens can reuse the same check-in screen.

5. **What breaks if removed?**
   Goal rows could show a check-in button, but tapping it would route to a missing screen.

6. **Mental model**
   This file is the daily report form. Pick done or skipped, optionally add context, and send it.

### `app/(tabs)/_layout.tsx`

1. **What is this file for?**
   It defines the bottom tab navigation.

2. **Most important lines**
   The new `Tabs.Screen` with `name="personal"` registers the Personal tab. Its icon uses `checklist`.

3. **Functions/components**
   `TabLayout` returns the tabs. The new personal entry adds the private tracker to the signed-in app.

4. **Connection to the app**
   This makes `app/(tabs)/personal.tsx` reachable from the main navigation.

5. **What breaks if removed?**
   The personal screen could exist, but users would not see it in the tab bar.

6. **Mental model**
   This file is the app's bottom menu. Task 6 adds a Personal button to that menu.

### `app/_layout.tsx`

1. **What is this file for?**
   It is the root navigation shell.

2. **Most important lines**
   `Stack.Screen name="check-ins/[goalId]"` registers the check-in route and gives it a header title.

3. **Functions/components**
   `RootStack` still handles auth routing and now knows about the check-in detail route.

4. **Connection to the app**
   Personal goals route into `/check-ins/:goalId`, and the root stack controls that screen.

5. **What breaks if removed?**
   Check-in navigation could become inconsistent or lose its intended title/header behavior.

6. **Mental model**
   This file is the building map. Task 6 adds the check-in room to the map.

### `components/ui/icon-symbol.tsx`

1. **What is this file for?**
   It maps iOS-style icon names to Android/web Material Icons.

2. **Most important lines**
   `checklist: 'checklist'` lets the Personal tab use the same icon name across platforms.

3. **Functions/components**
   `IconSymbol` translates a symbolic icon name into the right platform icon.

4. **Connection to the app**
   The Personal tab in `app/(tabs)/_layout.tsx` uses this mapping.

5. **What breaks if removed?**
   Android/web could fail to render the Personal tab icon correctly.

6. **Mental model**
   This file is the icon dictionary. Task 6 adds one more word to the dictionary.

### `supabase/migrations/0001_initial_schema.sql`

1. **What is this file for?**
   It defines the database tables, security rules, and safe database functions.

2. **Most important lines**
   `create_goal(...)` bootstraps a missing profile, checks challenge membership when a challenge goal is requested, and inserts the goal with `auth.uid()` as owner. The new `checkins owner update` policy lets the app replace today's check-in through upsert, but only for a goal owned by the signed-in user.

3. **Functions/components**
   `create_goal` is the safe goal creation path. `checkins owner update` is the RLS rule that makes one-check-in-per-day upsert work without allowing users to update someone else's check-in.

4. **Connection to the app**
   `src/features/goals/api.ts` calls `create_goal`, and `src/features/check-ins/api.ts` relies on the check-in insert/update policies.

5. **What breaks if removed?**
   Brand-new users may fail to create goals because their `profiles` row might not exist. Re-checking in for the same local date may fail because upsert needs update permission on conflict.

6. **Mental model**
   This migration is the rulebook behind the form. It decides who owns a goal and whether today's attendance sheet can be safely replaced.

### `tests/goals-api.test.ts`

1. **What is this file for?**
   It proves the goals API calls Supabase correctly.

2. **Most important lines**
   The create test checks that goal creation goes through `create_goal`. The list test checks the owner and active-status filters.

3. **Functions/components**
   One test covers creating a goal. One test covers listing active goals for the signed-in user.

4. **Connection to the app**
   These tests protect the data calls used by the personal tracker screen.

5. **What breaks if removed?**
   A future edit could switch back to unsafe direct inserts or load archived goals without tests catching it.

6. **Mental model**
   This file is a fake database receptionist. It checks which desk the goal API approaches.

### `tests/check-ins.test.ts`

1. **What is this file for?**
   It proves the check-in API creates one local-day check-in with the right fields.

2. **Most important lines**
   The fake system time makes the local date predictable. The upsert expectation checks the unique key behavior. The skipped test checks that blank notes become `null`.

3. **Functions/components**
   The first test covers a done check-in with a note. The second test covers a skipped check-in with no note.

4. **Connection to the app**
   These tests protect `app/check-ins/[goalId].tsx`, which calls `submitCheckIn`.

5. **What breaks if removed?**
   Future changes could accidentally create duplicate check-ins for the same day or store blank note strings.

6. **Mental model**
   This file is a practice attendance sheet. It checks that the same goal and same day land on the same row.

### `tests/personal-screens.test.tsx`

1. **What is this file for?**
   It proves the personal tracker and check-in screens call the right APIs.

2. **Most important lines**
   The create-goal test fills the daily goal and deadline inputs. The navigation test taps `Check in` and verifies typed dynamic routing with the goal timezone. The check-in test submits a done status with a note and verifies the goal timezone is used.

3. **Functions/components**
   One test covers adding a personal goal. One covers opening the check-in screen. One covers submitting a done check-in.

4. **Connection to the app**
   These tests protect the first end-to-end personal accountability loop.

5. **What breaks if removed?**
   The UI could stop wiring form values, navigation, or check-in status correctly without the test suite catching it.

6. **Mental model**
   This file is a robot user for the personal tracker. It creates a promise, opens it, and checks in.

### `tests/rls.test.ts`

1. **What is this file for?**
   It checks the database security migration text.

2. **Most important lines**
   The new goal function test checks profile bootstrap and `auth.uid()` ownership. The check-in update policy test checks that upsert updates remain owner-scoped.

3. **Functions/components**
   `policySql()` extracts one RLS policy at a time. The new tests protect the database behavior that Task 6 relies on.

4. **Connection to the app**
   The personal tracker and check-in APIs depend on these database rules to work safely.

5. **What breaks if removed?**
   A future SQL edit could remove safe goal creation or check-in update protection without the app tests catching it.

6. **Mental model**
   This file is the database security inspector. It confirms the new personal tracker doors lock from the inside.

## Task 7: Feed And Comments

This task added the challenge feed loop: challenge check-ins create feed events, challenge detail shows those events, and members can comment.

### `src/features/feed/api.ts`

1. **What is this file for?**
   Shared Supabase calls for challenge feed events and comments.
2. **Most important lines**
   `listFeedEvents` selects feed events with related `check_ins` and `comments`. `createComment` trims the comment body before inserting.
3. **Functions/components**
   `listFeedEvents(challengeId)` loads a challenge feed. `createComment(...)` posts a response to one feed event.
4. **Connection to the app**
   `app/challenges/[challengeId].tsx` uses both functions.
5. **What breaks if removed?**
   Challenge detail cannot show feed activity or post comments.
6. **Mental model**
   This is the feed service desk: load the wall, post a reply.

### `src/features/check-ins/api.ts`

1. **What is this file for?**
   It submits daily check-ins.
2. **Most important lines**
   After saving a check-in, it loads the goal's `challenge_id`. If present, it inserts a matching `feed_events` row with `check_in_done` or `check_in_skipped`.
3. **Functions/components**
   `submitCheckIn` now records the check-in and, for group goals, creates feed activity.
4. **Connection to the app**
   Check-in screens trigger feed updates automatically for challenge goals.
5. **What breaks if removed?**
   Group members would not see completed/skipped check-ins in the challenge feed.
6. **Mental model**
   This is the attendance sheet that also posts to the group wall when the goal belongs to a group.

### `app/challenges/[challengeId].tsx`

1. **What is this file for?**
   It renders one challenge's feed.
2. **Most important lines**
   `useFocusEffect` reloads the feed when opened. `labelByEventType` turns database event names into readable labels. `submitComment` posts a comment and refreshes the feed.
3. **Functions/components**
   `ChallengeDetailScreen` lists feed cards, notes, comments, and a response input per event.
4. **Connection to the app**
   Challenge list/create/join flows route here after selecting a group.
5. **What breaks if removed?**
   Users can enter a challenge, but cannot see activity or respond.
6. **Mental model**
   This is the group wall.

### `tests/feed.test.ts`

1. **What is this file for?**
   It verifies the feed API calls Supabase correctly.
2. **Most important lines**
   The list test checks challenge filtering and newest-first order. The comment test checks trimmed comment inserts.
3. **Functions/components**
   One test covers feed loading; one covers comment creation.
4. **Connection to the app**
   Protects the API used by challenge detail.
5. **What breaks if removed?**
   Feed queries or comment writes could drift silently.
6. **Mental model**
   Fake Supabase checks that feed calls use the right table and fields.

### `tests/challenge-feed-screen.test.tsx`

1. **What is this file for?**
   It verifies the challenge detail UI shows feed activity and posts comments.
2. **Most important lines**
   It renders a fake done check-in, checks note/comment text, types a response, and expects `createComment`.
3. **Functions/components**
   The test covers feed rendering plus comment submission.
4. **Connection to the app**
   Protects the visible challenge feed loop.
5. **What breaks if removed?**
   The screen could stop showing notes/comments or stop posting responses.
6. **Mental model**
   Robot group member reads the wall and writes a reply.

### `tests/check-ins.test.ts`

1. **What is this file for?**
   It verifies check-in persistence.
2. **Most important lines**
   The new feed-event test checks that challenge goal check-ins create `feed_events`.
3. **Functions/components**
   Existing tests cover daily upsert and notes; the new test covers group feed side effects.
4. **Connection to the app**
   Protects the bridge between check-ins and challenge feeds.
5. **What breaks if removed?**
   Challenge feed events could stop being created after check-ins.
6. **Mental model**
   Confirms attendance also posts to the wall when relevant.

## Task 8: Missed Check-In Automation

This task added a scheduled Supabase Edge Function that marks overdue active goals as missed and posts missed events to the challenge feed.

### `supabase/functions/generate-missed-checkins/deadline.ts`

1. **What is this file for?**
   Testable deadline logic for the missed-check-in job.
2. **Most important lines**
   `buildMissedCheckInCandidate` returns the local date that should be marked missed, including yesterday when a late job runs after midnight. `isDuplicateCheckInError` recognizes retry-safe unique-constraint conflicts.
3. **Functions/components**
   `buildMissedCheckInCandidate(goal, now)` decides whether a goal is overdue. `isDuplicateCheckInError(error)` tells the job when a duplicate insert can be safely ignored.
4. **Connection to the app**
   The Edge Function imports this logic before writing missed check-ins.
5. **What breaks if removed?**
   The job loses its timezone-aware deadline decision and duplicate-conflict handling.
6. **Mental model**
   This file is the clock checker.

### `supabase/functions/generate-missed-checkins/index.ts`

1. **What is this file for?**
   The Supabase Edge Function that scans active goals and creates missed check-ins.
2. **Most important lines**
   It requires `DEADLINE_JOB_SECRET`, uses `SUPABASE_SERVICE_ROLE_KEY`, selects active goals, inserts `status: 'missed'`, sets `auto_marked_missed: true`, and repairs missing `check_in_missed` feed events with duplicate-safe upsert.
3. **Functions/components**
   The `Deno.serve` handler runs the job, counts inserted/skipped/duplicate rows, and returns a JSON summary.
4. **Connection to the app**
   Missed commitments become regular `check_ins` rows, so feeds and future screens can display them.
5. **What breaks if removed?**
   Overdue goals would not be automatically marked missed.
6. **Mental model**
   This is the nightly attendance monitor.

### `supabase/migrations/0001_initial_schema.sql`

1. **What is this file for?**
   It defines database tables, indexes, functions, and security rules.
2. **Most important lines**
   `feed_events_checkin_type_unique_idx` prevents duplicate feed events for the same check-in and event type.
3. **Functions/components**
   No new function here. The new unique index is a database guardrail.
4. **Connection to the app**
   The missed-check-in job uses this index when it upserts missed feed events.
5. **What breaks if removed?**
   Two job runs could create duplicate missed feed cards for the same check-in.
6. **Mental model**
   This is a lock on the group wall that says one attendance event gets one matching wall post.

### `src/features/check-ins/api.ts`

1. **What is this file for?**
   It submits daily check-ins from the app.
2. **Most important lines**
   Group check-ins now use duplicate-safe feed-event upsert with `onConflict: 'check_in_id,event_type'`.
3. **Functions/components**
   `submitCheckIn` still saves the check-in first, then posts one matching feed event for challenge goals.
4. **Connection to the app**
   The check-in screen calls this function, and the challenge feed reads the resulting feed event.
5. **What breaks if removed?**
   Repeated check-ins could fail or create duplicate feed cards.
6. **Mental model**
   This is the attendance sheet posting exactly one matching update to the group wall.

### `docs/runbooks/deadline-jobs.md`

1. **What is this file for?**
   Operational notes for running and checking the missed-check-in job.
2. **Most important lines**
   The retry-safety note explains that `(goal_id, local_date)` prevents duplicate missed rows. The auth section documents the required bearer secret.
3. **Functions/components**
   None. This is documentation.
4. **Connection to the app**
   It tells us how the scheduled job should behave in production and local testing.
5. **What breaks if removed?**
   Future operators lose the checklist for missed-check-in jobs.
6. **Mental model**
   This is the job's operating manual.

### `tests/deadline-jobs.test.ts`

1. **What is this file for?**
   It verifies deadline math and important Edge Function behavior.
2. **Most important lines**
   The timezone tests check regular deadlines, late-after-midnight jobs, and first-deadline skips. The source checks confirm service-role usage, job-secret auth, missed status, auto-missed flag, feed event upsert, retry repair, and duplicate handling.
3. **Functions/components**
   Tests cover `buildMissedCheckInCandidate`, `isDuplicateCheckInError`, and required job source wiring.
4. **Connection to the app**
   Protects the automation that converts overdue goals into missed check-ins.
5. **What breaks if removed?**
   Deadline math or missed-job wiring could regress without fast feedback.
6. **Mental model**
   This is the job rehearsal.

## Task 9: Push Notification Foundation

This task added the first push-notification layer: registering Expo push tokens in the app, protected Edge Functions for sending/scanning notifications, and an operations runbook.

### `src/lib/notifications.ts`

1. **What is this file for?**
   It registers the current device for Expo push notifications.
2. **Most important lines**
   `Device.isDevice` skips simulators, permission checks avoid unwanted token requests, `getExpoPushTokenAsync({ projectId })` gets the Expo token, and `device_tokens.upsert(...)` stores it.
3. **Functions/components**
   `registerPushToken(userId)` asks for permission, gets the token, stores it for the signed-in user, and returns the token string.
4. **Connection to the app**
   Auth or onboarding can call this after a user signs in.
5. **What breaks if removed?**
   The backend has no device token to send notifications to.
6. **Mental model**
   This is the app writing the user's delivery address into the database.

### `supabase/functions/send-push/index.ts`

1. **What is this file for?**
   It forwards push messages to Expo's push API.
2. **Most important lines**
   `PUSH_SEND_SECRET` protects the endpoint, the empty-message check rejects bad calls, and `fetch('https://exp.host/--/api/v2/push/send', ...)` sends to Expo.
3. **Functions/components**
   The `Deno.serve` handler validates auth, reads `messages`, sends them, and returns Expo's response.
4. **Connection to the app**
   Reminder/comment/missed-job logic can call this function instead of talking to Expo directly.
5. **What breaks if removed?**
   Server-side jobs cannot deliver push notifications through a shared sender.
6. **Mental model**
   This is the post office window for push messages.

### `supabase/functions/send-reminders/index.ts`

1. **What is this file for?**
   It is the foundation for scheduled reminder sends.
2. **Most important lines**
   `REMINDER_JOB_SECRET` protects the job, service-role Supabase access reads `device_tokens`, and the response reports `tokens_seen`.
3. **Functions/components**
   The `Deno.serve` handler validates auth and scans registered device tokens.
4. **Connection to the app**
   Later reminder logic will combine these tokens with goals nearing their deadline.
5. **What breaks if removed?**
   There is no scheduled backend entry point for reminder notifications.
6. **Mental model**
   This is the reminder job's starting clipboard.

### `docs/runbooks/notifications.md`

1. **What is this file for?**
   It documents notification types, failure handling, and required secrets.
2. **Most important lines**
   It lists reminders, missed check-ins, comments, token cleanup, non-blocking failures, and bearer-secret invocation.
3. **Functions/components**
   None. This is operational documentation.
4. **Connection to the app**
   It explains how push delivery should be run and monitored.
5. **What breaks if removed?**
   Future setup/debugging loses the notification checklist.
6. **Mental model**
   This is the notification operations manual.

### `tests/notifications.test.ts`

1. **What is this file for?**
   It verifies app-side push token registration without using a real device.
2. **Most important lines**
   One test skips simulators, one stores a granted token, and one stops when permission is denied.
3. **Functions/components**
   Tests cover `registerPushToken`.
4. **Connection to the app**
   Protects the helper future auth/onboarding code will call.
5. **What breaks if removed?**
   Token registration could silently stop respecting device checks, permissions, or database shape.
6. **Mental model**
   This is a fake phone testing the notification signup flow.

### `tests/push-functions.test.ts`

1. **What is this file for?**
   It checks the Edge Function source for required push behavior.
2. **Most important lines**
   The tests confirm bearer secrets, Expo push API forwarding, service-role token reads, and empty-message protection.
3. **Functions/components**
   Source checks cover `send-push` and `send-reminders`.
4. **Connection to the app**
   Protects the backend notification entry points.
5. **What breaks if removed?**
   Push functions could lose auth or stop targeting the right tables/API without fast feedback.
6. **Mental model**
   This is a security checklist for the notification workers.
