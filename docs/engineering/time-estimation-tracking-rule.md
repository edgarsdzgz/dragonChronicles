# Time Estimation Tracking Rule

**Date:** January 12, 2025
**Status:** 📋 **ESTABLISHED RULE**
**Purpose:** Maintain visibility into project time estimates vs actual completion times

---

## 🎯 **Core Rule: Never Remove Time Estimates**

### **Fundamental Principle**

**All project phases, epics, and stories must maintain their original time estimates alongside actual completion times. Never remove or hide original estimates - always show both estimated vs actual time.**

---

## 📊 **Implementation Requirements**

### **Documentation Format**

When updating project documents, use this format:

`````markdown
### Epic X.X: [Name]

**Priority:** [Level]
**Estimated Effort:** [Original Estimate]
**Actual Effort:** [When Completed]
**Dependencies:** [Requirements]

#### Stories:

- [ ] **X.X.1** - [Story Name] (Estimated: [time], Actual: [when completed])

````bash

### **Status Tracking**

- **In Progress:** Show only estimated time

- **Completed:** Show both estimated and actual time

- **Overdue:** Highlight variance between estimated and actual

---

## 📈 **Benefits of Time Tracking**

### **Project Management**

- Track estimation accuracy across different types of work

- Identify patterns in over/under-estimation

- Improve resource allocation and scheduling

- Better predict future project timelines

### **Learning & Improvement**

- Understand which types of tasks take longer than expected

- Identify bottlenecks and efficiency opportunities

- Refine estimation techniques over time

- Build institutional knowledge about development velocity

### **Accountability & Transparency**

- Maintain honest visibility into project progress

- Enable data-driven decision making

- Support retrospective analysis

- Build confidence in future estimates

---

## 🔄 **Update Procedures**

### **When Starting Work**

1. Record the original estimate

1. Note any dependencies or constraints

1. Set baseline expectations

### **During Progress**

1. Update completion percentages

1. Note any scope changes affecting time

1. Flag potential overruns early

### **Upon Completion**

1. Record actual completion time

1. Calculate variance from estimate

1. Note any lessons learned

1. Update documentation with both times

---

## 📋 **Required Fields for All Items**

### **Phases**

- **Estimated Duration:** Original time estimate

- **Actual Duration:** Time taken when completed

- **Variance:** Difference between estimated and actual

- **Notes:** Any factors affecting timeline

### **Epics**

- **Estimated Effort:** Original estimate (e.g., "3-4 weeks")

- **Actual Effort:** Time taken when completed

- **Story Count:** Number of stories included

- **Completion Rate:** Stories completed vs total

### **Stories**

- **Estimated Time:** Original estimate (e.g., "2-3 days")

- **Actual Time:** Time taken when completed

- **Complexity:** Simple/Medium/Complex

- **Dependencies:** Blocking factors

---

## 🎯 **Quality Gates**

### **Before Starting Any Phase/Epic/Story**

- [ ] Original time estimate is documented

- [ ] Dependencies are clearly identified

- [ ] Success criteria are defined

- [ ] Baseline is established

### **Upon Completion** (2)

- [ ] Actual completion time is recorded

- [ ] Variance from estimate is calculated

- [ ] Lessons learned are documented

- [ ] Documentation is updated with both times

### **During Project Reviews**

- [ ] Time tracking data is analyzed

- [ ] Estimation accuracy is assessed

- [ ] Process improvements are identified

- [ ] Future estimates are refined based on learnings

---

## 📊 **Example Implementation**

### **Before Completion**

```markdown

### Epic 1.1: Core Game Loop Foundation

**Priority:** Critical
**Estimated Effort:** 3-4 weeks
**Dependencies:** Phase 0 Complete
**Status:** In Progress (Week 2 of 4)

#### Stories: (2)

- [x] **1.1.1** - Journey State Management (Estimated: 3 days)

- [ ] **1.1.2** - Distance Progression System (Estimated: 4 days)

- [ ] **1.1.3** - Ward/Land State Machine (Estimated: 5 days)

```text

### **After Completion**

```markdown

### Epic 1.1: Core Game Loop Foundation ✅

**Priority:** Critical
**Estimated Effort:** 3-4 weeks
**Actual Effort:** 3.5 weeks
**Variance:** +0.5 weeks (+14% over estimate)
**Dependencies:** Phase 0 Complete
**Status:** Completed

#### Stories: (3)

- [x] **1.1.1** - Journey State Management (Estimated: 3 days, Actual: 3 days, Variance: 0%)

- [x] **1.1.2** - Distance Progression System (Estimated: 4 days, Actual: 6 days, Variance: +50%)

- [x] **1.1.3** - Ward/Land State Machine (Estimated: 5 days, Actual: 4 days, Variance: -20%)

```javascript

---

## 🚨 **Critical Requirements**

### **Never Remove**

- Original time estimates

- Historical completion data

- Variance calculations

- Lessons learned notes

### **Always Update**

- Actual completion times

- Current progress status

- Variance from estimates

- Updated dependencies

### **Always Analyze**

- Estimation accuracy patterns

- Common overrun causes

- Efficiency opportunities

- Process improvements

---

## 📚 **Related Documentation**

- **Epic of Epics:** Main project roadmap with time tracking

- **Phase Completion Reports:** Detailed time analysis per phase

- **Retrospective Notes:** Lessons learned and process improvements

- **Estimation Guidelines:** Best practices for future estimates

---

**This rule ensures complete visibility into project timing, enables continuous improvement of estimation accuracy, and maintains accountability for project delivery timelines.**
````
`````

```

```
