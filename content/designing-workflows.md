---
title: "Stop Designing Dashboards. Start Designing Workflows."
date: "2026-07-13"
description: "Why the modern obsession with dashboards is killing productivity, and how workflow-centric design fixes it."
tags: ["design", "ux"]
readingTime: "8 min read"
---

# Stop Designing Dashboards. Start Designing Workflows.

It’s 2026, and if I see another B2B SaaS application that drops me onto a “Dashboard” containing 15 different charts that I never asked for, I might actually lose my mind. 

For the better part of a decade, the default entry point for any web application has been the dashboard. It’s the architectural equivalent of a foyer filled with random clocks showing the time in different time zones. Sure, it looks impressive when you’re taking a tour, but when you actually live there, you realize you just wanted to know if you were late for your meeting.

We need to stop designing dashboards and start designing workflows. In this post, I want to dive deep into the architectural shift required to move from state-based dashboard views to event-driven workflow interfaces.

## The Dashboard Fallacy

The dashboard fallacy is the belief that providing maximum visibility equates to providing maximum utility. This stems from a fundamentally flawed understanding of how users interact with software. Users don't log into a project management tool to *observe the state of their projects*; they log in to *move a project forward*.

When you build a dashboard, you are typically pulling state from a database, aggregating it, and displaying it. 

```sql
-- The classic dashboard query pattern (antipattern)
SELECT 
    status, 
    COUNT(*) as total,
    SUM(budget) as total_budget
FROM 
    projects
WHERE 
    organization_id = 'org_123'
GROUP BY 
    status;
```

This is cheap to write but expensive to compute at scale, and more importantly, it offers zero actionable value. A pie chart showing that 30% of projects are "At Risk" doesn't help the user. The user needs a workflow that says: "These 3 projects are at risk. Click here to ping the stakeholders, or click here to reallocate budget."

## Shifting to Workflow-Centric Architecture

A workflow-centric design requires a fundamentally different backend architecture. You cannot build a good workflow UI on top of a simple CRUD API. You need an event-driven system or a state machine that understands the *transitions*, not just the current state.

### The State Machine Pattern

When I was rebuilding the core task engine for a large logistics company back in 2024, we realized our React frontend was buckling under the weight of trying to infer what actions a user could take based on a massive JSON blob of state.

Instead of passing down state, we started passing down *available transitions*. We implemented a strict Finite State Machine (FSM) on the backend using XState concepts, though written in Rust for performance.

```rust
// A simplified representation of our Rust state machine
#[derive(Debug, PartialEq)]
enum OrderState {
    Created,
    Allocated,
    Picked,
    Shipped,
    Delivered,
}

#[derive(Debug)]
enum OrderEvent {
    AllocateInventory { warehouse_id: String },
    PickItems { picker_id: String },
    Ship { tracking_number: String },
    Deliver,
}

impl Order {
    fn apply(&mut self, event: OrderEvent) -> Result<(), TransitionError> {
        match (&self.state, event) {
            (OrderState::Created, OrderEvent::AllocateInventory { warehouse_id }) => {
                self.warehouse_id = Some(warehouse_id);
                self.state = OrderState::Allocated;
                Ok(())
            },
            // ... other transitions
            _ => Err(TransitionError::InvalidTransition),
        }
    }

    fn available_actions(&self) -> Vec<ActionSchema> {
        // Return a schema that the frontend can use to render UI
        // Not just state, but *what can be done next*
        match self.state {
            OrderState::Created => vec![ActionSchema::new("AllocateInventory")],
            OrderState::Allocated => vec![ActionSchema::new("PickItems")],
            // ...
        }
    }
}
```

By returning `available_actions` directly to the client, the UI became incredibly dumb—in a good way. The UI didn't need to know *why* an order could be allocated; it just rendered an "Allocate" button if the backend said it was possible. 

### Designing the Interface

In a workflow-centric UI, the entry point is an Inbox or a Task Queue, not a Dashboard. 

Consider the UI component structure. Instead of a `DashboardGrid` mapping over `ChartCards`, you have a `TaskStream`.

```tsx
// Frontend React example of a Workflow-centric entry
function TaskStream({ tasks }: { tasks: Task[] }) {
  return (
    <div className="task-stream">
      {tasks.length === 0 ? (
        <EmptyState message="You're all caught up!" />
      ) : (
        tasks.map(task => (
          <WorkflowCard key={task.id} task={task} />
        ))
      )}
    </div>
  );
}

function WorkflowCard({ task }: { task: Task }) {
  // We dynamically render the form/actions based on the task's required inputs
  return (
    <div className="workflow-card">
      <h3>{task.title}</h3>
      <p>{task.context}</p>
      
      <div className="actions">
        {task.available_actions.map(action => (
          <DynamicActionRenderer key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}
```

### Edge Cases and Trade-offs

The primary edge case you hit with this architecture is **bulk actions**. If every item has its own state machine and available actions, how do you let a user select 50 items and click "Approve All"?

This was a massive headache for us. We ended up having to build a bulk-action orchestrator. The frontend would ask the backend: "Given these 50 entity IDs, what is the intersection of their available actions?"

```typescript
// The intersection logic on the backend
function getBulkActions(entities: Entity[]): Action[] {
  if (entities.length === 0) return [];
  
  // Start with the actions of the first entity
  let commonActions = entities[0].availableActions;
  
  // Intersect with the rest
  for (let i = 1; i < entities.length; i++) {
    const entityActions = entities[i].availableActions.map(a => a.id);
    commonActions = commonActions.filter(a => entityActions.includes(a.id));
  }
  
  return commonActions;
}
```

This trade-off—making bulk operations slightly more complex to compute—was entirely worth it for the clarity it brought to the single-item workflow.

### The Personal Anecdote

I remember sitting in a user testing session. We had just replaced a complex, filter-heavy dashboard with a simple, chronological inbox of "Things needing your attention." The user, a mid-level manager who usually spent 20 minutes every morning clicking through tabs to figure out what was broken, cleared their inbox in 4 minutes. 

They looked at me and said, "Is that it? Did I miss something?"

That is the feeling of good software. It shouldn't feel like you're piloting a 747. It should feel like you have an incredibly competent assistant handing you exactly the right piece of paper at exactly the right time.

Stop building cockpits. Start building workflows.
