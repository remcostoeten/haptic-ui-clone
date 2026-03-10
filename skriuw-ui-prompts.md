# Skriuw UI Prompts

## Editor Chrome UI Prompt
Design a pure UI refresh for the editor chrome of an existing keyboard-first notes and journal app. Do not redesign the whole product. Focus only on the editor surface and the immediate controls around it.

This is for an existing app, so stay grounded in the current structure:
- desktop has a left notes sidebar, central editor, and right metadata panel
- mobile has sheet-like navigation and inspector behavior
- the product is a personal notes and journaling tool, not a team workspace
- the app already has command palette, settings, templates, and note metadata

Target the UI around these existing files:
- `src/features/editor/components/editor-toolbar.tsx`
- `src/features/editor/components/editor-container.tsx`
- `src/features/notes/components/metadata-panel.tsx`

Your task:
- redesign the editor chrome as a premium, production-ready interface
- keep it pure UI
- do not invent backend logic, syncing systems, collaboration, or product strategy
- do not expand scope into the sidebar architecture or full settings redesign

Focus areas:
- top editor toolbar
- title area / current note identity
- previous / next navigation affordances
- sidebar toggle and metadata toggle controls
- save state presence
- editor mode presence if visually relevant
- metadata panel styling and hierarchy
- mobile editor header treatment
- empty editor state if no note is selected

The tone should feel:
- calm
- precise
- keyboard-native
- desktop-first
- tactile but restrained
- more like a crafted writing tool than a generic SaaS dashboard

Avoid:
- fake collaboration avatars
- comments UI
- analytics dashboards
- marketing language
- made-up AI features
- generic “workspace” branding

Use realistic content placeholders such as:
- note title
- folder breadcrumb
- modified time
- word count
- reading time
- tags
- outline items

Show these states:
- desktop default editor chrome
- desktop with metadata panel open
- mobile header version
- no note selected empty state
- hover / active / keyboard-focused control states

Design requirements:
- strong spacing rhythm
- excellent information hierarchy
- polished icon treatment
- subtle surface layering
- quiet but confident typography
- tasteful shadows and borders
- refined hover/focus/pressed states
- intentional motion notes

Also define:
- color tokens
- spacing scale
- radius system
- typography scale
- shadow treatment
- interaction state rules
- motion behavior

Output format:
- provide the UI concept
- describe the desktop layout
- describe the mobile layout
- list the key components that should exist
- specify which existing file each part most likely belongs in
- if a new component should be added, give the exact proposed filename and folder
- if a component should stay in place, say so explicitly

Important:
- ask for or state concrete filenames and locations for any new UI pieces
- keep the result implementation-oriented enough that it can be mapped back into this repo
- do not return vague design direction only
