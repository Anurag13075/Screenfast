---
title: "Onboarding Should Be a Feature, Not a Tutorial"
date: "2026-07-16"
description: "Why step-by-step tooltip tutorials are failing your users, and how to build context-aware, state-driven onboarding systems that actually drive activation."
tags: ["design", "ux", "engineering"]
readingTime: "8 min read"
---

# Onboarding Should Be a Feature, Not a Tutorial

Let me tell you a story from a few years ago. We had just launched a massive overhaul of our core product, a complex B2B analytics platform. We were incredibly proud of the new architecture, the snappy React frontend, and the powerful new querying engine we built on top of ClickHouse. To make sure users knew how to use all this power, we integrated a popular third-party onboarding tool and built a 14-step tooltip tour. 

When a user logged in, the screen would dim, and a little blue box would say: "Welcome to the new dashboard! Click next to learn more." 

The data rolled in a week later, and it was brutal. 87% of users clicked "Skip Tour" immediately. Of the 13% who didn't, most dropped off by step 4. But the real kicker was our support tickets. They spiked. People were asking how to do the exact things the tour explicitly covered in steps 7, 8, and 12.

That was the day I realized: **Onboarding isn't a tutorial you slap on top of your app. Onboarding is a core feature that requires deep architectural integration.**

## The Problem with the "Tooltip Tour" Pattern

The traditional tooltip tour suffers from a fundamental misunderstanding of human psychology and cognitive load. When a user logs into a new product, their brain is in "goal-oriented mode." They signed up to solve a specific problem (e.g., "I need to generate a monthly report"). 

When you hijack their screen with a modal that forces them to learn 10 different features out of context, you are interrupting their goal. It's like walking into a hardware store to buy a hammer, and the greeter stops you at the door to give you a 20-minute lecture on how the plumbing, electrical, and gardening sections work.

Furthermore, these tours are almost entirely disconnected from the actual state of the application. They rely on DOM selectors to attach tooltips. If your UI changes dynamically (as single-page applications do), the tour breaks. If the network is slow and a button hasn't rendered yet, the tour breaks.

### The Technical Debt of DOM-coupled Onboarding

Let's look at a typical implementation of a DOM-coupled tour:

```javascript
// A typical fragile tooltip setup
const steps = [
  {
    target: '.nav-dashboard',
    content: 'This is your dashboard.',
  },
  {
    target: '#generate-report-btn',
    content: 'Click here to generate a report.',
  }
];

// What happens when you refactor the button component?
// <Button id="generate-report-btn" /> becomes <Button data-testid="report-btn" />
// The tour breaks silently.
```

This approach tightly couples your product marketing/onboarding logic to your CSS class names or DOM IDs. It's a nightmare to maintain. Every time a designer tweaks the layout, an engineer has to remember to go fix the onboarding scripts.

## The Paradigm Shift: Context-Aware, State-Driven Onboarding

To build onboarding that works, we need to treat it as a state machine deeply integrated into the application's business logic. Onboarding shouldn't just explain *how* to do something; it should guide the user *through* doing it, using actual application state to track progress.

We call this "Context-Aware Onboarding."

### Architecture of a Context-Aware Onboarding System

Instead of a third-party script injecting DOM overlays, our onboarding system needs to be a first-class citizen in our global state management (whether that's Redux, Zustand, React Context, or a custom event bus).

Here is the architectural pattern we migrated to:

1.  **The Event Firehose:** Every meaningful user action (creating a project, inviting a user, generating a query) emits a domain event.
2.  **The State Machine:** An `OnboardingEngine` listens to these events and maintains the user's progress against predefined "activation milestones."
3.  **The UI Layer:** Components subscribe to the `OnboardingEngine` and conditionally render inline tips, empty states, or suggested actions based on the current milestone.

#### Designing the State Machine

Let's build a simplified version using XState to manage our onboarding flow. This ensures we have a deterministic, heavily-tested onboarding journey.

```typescript
import { createMachine, assign } from 'xstate';

interface OnboardingContext {
  projectsCreated: number;
  teammatesInvited: number;
  firstQueryRun: boolean;
}

export const onboardingMachine = createMachine({
  id: 'onboarding',
  initial: 'new_user',
  context: {
    projectsCreated: 0,
    teammatesInvited: 0,
    firstQueryRun: false,
  },
  states: {
    new_user: {
      on: {
        CREATE_PROJECT: {
          target: 'has_project',
          actions: assign({
            projectsCreated: (context) => context.projectsCreated + 1
          })
        }
      }
    },
    has_project: {
      on: {
        INVITE_TEAMMATE: {
          actions: assign({
            teammatesInvited: (context) => context.teammatesInvited + 1
          })
        },
        RUN_QUERY: {
          target: 'activated',
          actions: assign({ firstQueryRun: true })
        }
      }
    },
    activated: {
      type: 'final'
    }
  }
});
```

Notice how this operates purely on domain events (`CREATE_PROJECT`, `RUN_QUERY`), completely agnostic of the DOM. 

### Integrating with the UI: Inline and Contextual

Once we have our robust state machine, we can build UIs that respond gracefully. Instead of a blocking modal, we use the "Empty State" as our primary onboarding real estate.

If the user is in the `new_user` state, the main dashboard area shouldn't just be a blank white screen with a tiny "Create Project" button. It should be a dedicated, beautifully designed component that explains the value of a project and provides a one-click template to get started.

```tsx
import { useMachine } from '@xstate/react';
import { onboardingMachine } from './onboardingMachine';

export const Dashboard = () => {
  const [state, send] = useMachine(onboardingMachine);

  if (state.matches('new_user')) {
    return (
      <EmptyState>
        <h2>Let's build your first pipeline</h2>
        <p>Projects organize your data sources and queries. Start with a template to see it in action.</p>
        <Button onClick={() => {
           // Create project via API, then...
           send({ type: 'CREATE_PROJECT' });
        }}>
          Use E-commerce Template
        </Button>
      </EmptyState>
    );
  }

  if (state.matches('has_project') && !state.context.firstQueryRun) {
    return (
      <InlineTip>
        <strong>Next step:</strong> Try running a sample query on your new data source.
        <CodeSnippet>SELECT * FROM users LIMIT 10;</CodeSnippet>
      </InlineTip>
    );
  }

  return <FullDashboardComponent />;
};
```

## Edge Cases and Trade-offs

Building onboarding as a feature introduces complexity. Let's look at the trade-offs.

### Trade-off 1: Development Speed vs. User Success
A third-party tooltip tool can be set up by a PM in an hour. Building a state-driven onboarding engine takes weeks of engineering time. However, the ROI of the latter is massive. In our case, transitioning to context-aware onboarding increased our 30-day retention by 22%. The engineering investment paid off ten-fold.

### Edge Case: The "Returning Expert"
What happens when a power user creates a new workspace or a new account? Forcing them through the "New User" flow is frustrating. Because our system is state-driven, we can easily add an "opt-out" mechanism or detect advanced behavior.

```typescript
// If the user runs a complex command via CLI, we can instantly fast-forward their onboarding state.
if (api.detectAdvancedUsage()) {
  onboardingEngine.send('FAST_FORWARD_TO_ACTIVATED');
}
```

### Edge Case: Cross-Device Synchronization
If a user creates a project on their desktop, their mobile app shouldn't tell them to create a project. The `OnboardingContext` must be synchronized with the backend. 

We solved this by storing the onboarding state machine context in our PostgreSQL database (as a JSONB column on the `users` table) and hydrating it on app load.

```sql
-- Updating the onboarding state in the backend
UPDATE users 
SET onboarding_state = '{"projectsCreated": 1, "firstQueryRun": false}', 
    current_state_node = 'has_project' 
WHERE id = 'user_123';
```

## The Role of Progressive Disclosure

Another key principle of building onboarding as a feature is "Progressive Disclosure." Don't show the user the advanced settings until they have mastered the basics.

When a user first lands on our querying interface, we hide the raw SQL editor. We only show a visual query builder. Once they successfully run 3 queries using the visual builder, we subtly introduce a toggle: "Switch to raw SQL." 

This isn't a tooltip saying "Hey, we have SQL too!" It's an intelligent UI adapting to the user's proven competence level.

## Conclusion

Stop treating onboarding as an afterthought. Stop plastering fragile tooltips over your beautiful UI. Treat user activation as a core engineering challenge. Build state machines to track their progress, use domain events to trigger UI adaptations, and design empty states that do the heavy lifting of education.

When onboarding becomes a deeply integrated feature, your users won't even realize they're being onboarded. They'll just think your product is incredibly intuitive to use. And isn't that the ultimate goal of design?