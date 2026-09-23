---
title: "Stop Designing Dashboards. Start Designing Workflows."
date: "2024-07-13"
description: "Why static data visualization is failing your users and how task-oriented design leads to better product outcomes."
tags: ["design", "ux"]
readingTime: "8 min read"
---

## The Dashboard Delusion

For the better part of the last decade, B2B SaaS has been obsessed with dashboards. You log in, and you are immediately greeted by a barrage of charts, graphs, and top-line metrics. The assumption has always been that users need "insights." But here is the hard truth: most users do not log into your application to look at data. They log in to do a job. 

When you design a dashboard, you are designing a static view. You are presenting information and forcing the user to connect the dots, figure out what requires their attention, and then navigate elsewhere to actually take action. This creates friction. 

## Moving from State to Transition

A workflow-centric approach shifts the focus from *state* (what the data looks like right now) to *transition* (how the data needs to change). Instead of showing a bar chart of "Unresolved Tickets by Priority," a workflow design presents the user with the most critical ticket, alongside the context needed to resolve it, and the tools to do so immediately.

### Action-Oriented Architecture

To build workflows, you need an architecture that supports them. This often means moving away from traditional RESTful endpoints that just return resource states, and toward event-driven systems that can surface state changes requiring action.

```typescript
// Traditional Dashboard Approach: Fetching State
const fetchDashboardData = async () => {
  const tickets = await api.get('/tickets');
  const metrics = calculateMetrics(tickets);
  return <Dashboard metrics={metrics} />;
};

// Workflow Approach: Fetching Next Action
const fetchNextAction = async (userId) => {
  const nextTask = await api.get(`/users/${userId}/queue/next`);
  return <ActionWorkspace task={nextTask} />;
};
```

## Designing the Feedback Loop

Workflows require tight feedback loops. When a user completes an action, the system should immediately present the next logical step. Do not dump them back to the main dashboard. If they just approved an expense report, show them the next one in the queue. 

By designing workflows instead of dashboards, you reduce cognitive load. You stop making the user guess what they should do next, and you start actively guiding them through their daily tasks. The result is higher engagement, lower churn, and software that actually feels useful.
