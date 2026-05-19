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
