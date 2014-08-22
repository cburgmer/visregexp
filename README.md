This is an experiment to create a visual regression testing tool that is cross-browser *and* integrates with your build pipeline.

Rationale
---------
- Visual Regression Testing is the new hotness.
- Your team wants to use it in a build pipeline.
- You need to support IE, too.

Technical decisions
-------------------
- WebDriver (http://www.w3.org/TR/webdriver/)
- Cross-device & cross-browser sign-off through input file fingerprinting
- Test sign-off (fingerprints) shared through version control

Yet to be implemented
---------------------
- Take screenshot and save ✓
- Compare to reference and fail/succeed
- Support hover, active styles
- Configurable browser support
- Sign-off process
- Test reporter
- Solve the "state problem", where the build server needs to remember the reference images

Frequently Asked Questions (nobody asked)
-----------------------------------------
- So you stop developing CSS Critic?

    No way. I still very much believe in in-browser testing of UI.

- So why yet another tool?

    I'd like to supplement CSS Critic with a tool for automation for Continuous Integration.
