{% set title = "Sample Page" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Author Guide - Sample Page"
  layout: authorGuide.md
  pageNav: 2
  pageNavTitle: "Topics"
</frontmatter>

# Programming Module — [[institutionName : Generic Module]]

<img src="../../images/[[institutionLogo : default]]-logo.png" class="cv-bind" alt="[[institutionName : Institution]] logo" style="height: 60px; margin-bottom: 1rem;" />

Welcome, **[[username : Student]]**! This is the exercise sheet for [[institutionName : your module]].

**View as:** [NUS](./samplePage.html?adapt=nus) · [Sample Institution](./samplePage.html?adapt=sample) · [Reset](./samplePage.html?adapt=clear)

---

## Exercises at a Glance

| Exercise | Topic | Status |
| :------- | :---- | :----- |
| Exercise 1 | Setting Up Your Environment | <cv-label name="exercise-1">OPTIONAL</cv-label> |
| Exercise 2 | Writing Your First Program | <cv-label name="exercise-2">OPTIONAL</cv-label> |
| Exercise 3 | Advanced Problem Solving | <cv-label name="exercise-3">OPTIONAL</cv-label> |
| Exercise 4 | Peer Review & Submission | <cv-label name="exercise-4">OPTIONAL</cv-label> |

Switch adaptation using the links above to see the labels change. **NUS** makes exercises 1, 2, and 4 compulsory; **Sample Institution** makes all four compulsory.

---

## Exercise 1 — Setting Up Your Environment <cv-label name="exercise-1"></cv-label>

Configure your development environment for [[institutionName : this module]].

<cv-toggle toggle-id="linux" show-label show-peek-border show-inline-control>

**Linux Setup**

```bash
sudo apt-get update && sudo apt-get install -y build-essential git python3
python3 --version
```

</cv-toggle>

<cv-toggle toggle-id="windows" show-label show-peek-border show-inline-control>

**Windows Setup**

```powershell
winget install Python.Python.3 Git.Git
python --version
```

</cv-toggle>

<cv-toggle toggle-id="mac" show-label show-peek-border show-inline-control>

**macOS Setup**

```bash
brew install python3 git
python3 --version
```

</cv-toggle>

---

## Exercise 2 — Writing Your First Program <cv-label name="exercise-2"></cv-label>

Create a file named `hello.py` and write a personalised greeting:

```python
# [[institutionName : Module]] — Exercise 2
name = "[[username : Student]]"
print(f"Hello, {name}! Welcome to [[institutionName : the module]].")
```

Run it with:

```bash
python3 hello.py
```

<box type="tip">

Submit `hello.py` to the **[[institutionName : institution]]** portal once you're done.
</box>

---

## Exercise 3 — Advanced Problem Solving <cv-label name="exercise-3"></cv-label>

Solve the following problem and submit your solution.

**Problem:** Given a list of integers, return all pairs that sum to a target value.

```python
def find_pairs(nums: list[int], target: int) -> list[tuple[int, int]]:
    # Your solution here
    pass
```

<box type="info">

**[[institutionName : Institution]] grading:** Submissions are graded automatically. Ensure your function signature matches exactly.
</box>

---

## Exercise 4 — Peer Review & Submission <cv-label name="exercise-4"></cv-label>

Review a classmate's submission for Exercise 3 and provide structured feedback.

1. Clone their repository:

```bash
git clone https://github.com/[[username : classmate]]/exercise3.git
```

2. Run their tests locally and check the output.
3. Submit your review via the **[[institutionName : institution]]** peer review portal.

---

## Institution Resources

<box type="info">

The sections below are controlled by the active adaptation — they are site-managed and cannot be toggled by individual users.
</box>

<cv-toggle toggle-id="nus-resources" show-label>

### NUS Resources

Submit your work via **LumiNUS** before the deadline.

- **Office hours:** Monday–Friday, 10am–5pm (COM1 Level 2)
- **Forum:** [Piazza — CS Module](https://example.com)
- **Support:** [help@comp.nus.edu.sg](mailto:help@comp.nus.edu.sg)

</cv-toggle>

<cv-toggle toggle-id="sample-resources" show-label>

### Sample Institution Resources

Submit via the **Sample Portal** using your student ID.

- **Office hours:** Weekdays, 9am–6pm
- **Forum:** [Sample Forum](https://example.com)
- **Support:** [support@sample.edu](mailto:support@sample.edu)

</cv-toggle>

---

*This page is personalised for **[[institutionName : all students]]**. Logged in as: [[username : Guest]]*
