---
name: Feature request
about: Suggest an idea for this project
title: "[FEATURE]"
labels: enhancement
assignees: Nilonic

---

Hi, can you explain this please:

# Feature Request
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**If related to a problem, is it a bug, and is there an open report? if so, link it below**
link it here! or if there is no link, describe said issue, and open a Bug Report!

**If it were to be implemented, would people use it?**
Explain why *you* would use it, and how *you* think others would use it

**Explain how we may implement it**
what would you like to see feature-wise, optionality, and whether or not it can be disabled server-side (hoster), or client-side (you)

**(OPTIONAL) Provide code, clearly commented and labeled, that would implement the feature in the way you would like**
Code developed by an AI, or suspected to be developed by an AI, will be rejected
ensure said code is tested, and you add attribution (if you want, we don't mind)
example (note: this example has already been added):
```js
// TARGET: server.js
// TARGET FUNCTION: cleanupApiKeys
// TARGET LINE IN FUNCTION (from first line in function): 12
// END TARGET LINE IN FUNCTION (from target line): 7
// Made By: <your amazing name here>. Github: <your amazing github link here> | <any aditional socials>
    if (global.gc) //remove redundant brackets
        global.gc(); // Explicitly invoke garbage collection
    else {
        if (!hasComplainedAboutGC) { // Log a warning if GC is not exposed
            debugLog('Garbage collection not exposed. Run node with --expose-gc.', "\x1b[33m");
            hasComplainedAboutGC = true; // Set flag to prevent repeated warnings
        }
    }
```
