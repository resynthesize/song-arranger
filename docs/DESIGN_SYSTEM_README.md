# Cyclone Design System Documentation

**Version:** 1.0.0
**Status:** Specification Complete
**Last Updated:** October 21, 2025

---

## Overview

The Cyclone Design System is a comprehensive, dual-theme UI framework designed for music sequencing applications. It systematizes the existing ad-hoc design into a coherent, token-driven architecture that supports two distinct visual modes:

1. **Retro Terminal** - Authentic VT323-based CRT aesthetic with phosphor glow effects
2. **Modern Minimal** - JetBrains Mono-based professional DAW aesthetic

This documentation package provides everything needed to understand, implement, and maintain the design system.

---

## Documentation Structure

### Core Documentation

#### 📘 [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md)
**Complete design system specification**

The master reference document covering:
- Design philosophy and principles
- Token architecture (3-tier system)
- Complete color system with accessibility analysis
- Typography scales for both themes
- Spacing system (4px/8px grid)
- Component patterns and architecture
- Theming system implementation
- Accessibility guidelines
- Migration strategies
- Package structure for portability

**Use this when:**
- Learning the design system from scratch
- Understanding design decisions and rationale
- Looking up component patterns
- Planning new features or components

---

#### 📗 [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md)
**Quick reference guide for all design tokens**

A practical, searchable reference including:
- Quick token lookup tables
- Complete token list with values
- Usage examples for common scenarios
- Token naming conventions
- Best practices (DO/DON'T)
- Migration checklist

**Use this when:**
- Writing CSS for components
- Looking up specific token values
- Replacing hard-coded values
- Daily development work

---

#### 📙 [THEME_COMPARISON_GUIDE.md](./THEME_COMPARISON_GUIDE.md)
**Side-by-side theme comparison and guidelines**

Visual and functional comparison of both themes:
- Visual philosophy differences
- Color palette comparison with contrast ratios
- Typography comparison and rationale
- Component showcase (both themes)
- Effect comparison (glows, shadows, animations)
- Use case recommendations
- Theme selection decision tree
- Performance considerations

**Use this when:**
- Deciding which theme to use
- Understanding theme differences
- Designing new components
- Explaining design choices to stakeholders

---

#### 📕 [DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md](./DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md)
**Step-by-step implementation plan**

Practical roadmap for implementing the design system:
- 6-phase implementation plan (2-3 weeks)
- Detailed tasks and checklists for each phase
- Testing strategy (visual regression, accessibility, theme switching)
- Rollback strategy
- Success metrics
- Timeline and resource estimates

**Use this when:**
- Planning the implementation
- Breaking down work into tasks
- Estimating effort and timeline
- Tracking implementation progress

---

## Quick Start

### For Designers

1. **Start here:** [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md) - Read sections 1-3 (Philosophy, Tokens, Colors)
2. **Then read:** [THEME_COMPARISON_GUIDE.md](./THEME_COMPARISON_GUIDE.md) - Understand both themes
3. **Reference:** [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md) - Use while designing

**Key takeaways:**
- Always design for both themes
- Use semantic tokens, not hard-coded values
- Check color contrast ratios (WCAG AA minimum)
- Consider accessibility in all decisions

### For Developers

1. **Start here:** [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md) - Practical token reference
2. **Then read:** [DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md](./DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md) - Implementation plan
3. **Reference:** [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md) - Deep dive when needed

**Key takeaways:**
- Use `var(--token-name)` instead of hard-coded values
- Test components in both themes
- Follow atomic design structure
- Write theme-agnostic components

### For Product Managers

1. **Start here:** [THEME_COMPARISON_GUIDE.md](./THEME_COMPARISON_GUIDE.md) - Understand user-facing differences
2. **Then read:** [DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md](./DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md) - Timeline and effort
3. **Reference:** [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md) - Section 1 (Philosophy)

**Key takeaways:**
- Both themes serve different use cases
- Implementation takes 2-3 weeks
- Improves maintainability and consistency
- Enables future product expansion

---

## Key Concepts

### Design Tokens

**What:** CSS custom properties that define all design values (colors, spacing, typography, etc.)

**Why:**
- Single source of truth
- Easy theme switching
- Consistent visual language
- Scalable and maintainable

**Example:**
```css
/* ❌ Don't: Hard-coded values */
.button {
  color: #00ff00;
  padding: 12px 16px;
  font-size: 20px;
}

/* ✅ Do: Use tokens */
.button {
  color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
}
```

### Three-Tier Token Architecture

```
Primitive Tokens  →  Semantic Tokens  →  Component Tokens
(raw values)         (context)            (specific use)

--primitive-green-500  →  --color-primary  →  --button-color
#00ff00                    Context: main text   Context: button text
```

**Benefits:**
- Primitives can be reused in different contexts
- Semantic tokens provide meaning
- Component tokens enable fine-grained control
- Easy to update global or specific values

### Atomic Design

Components are organized by complexity:

```
Atoms → Molecules → Organisms → Templates → Pages
(Button)  (SearchBar)  (Header)     (Layout)    (HomePage)
```

**Benefits:**
- Reusable components
- Clear hierarchy
- Easy to understand structure
- Scalable component library

### Theme-Agnostic Components

Components don't know which theme they're in - they use tokens that change per theme:

```tsx
// Component doesn't care about theme
export const TerminalButton = ({ children }) => (
  <button className="terminal-button">
    {children}
  </button>
);
```

```css
/* CSS handles theme differences */
.terminal-button {
  color: var(--color-primary);  /* Green in retro, white in modern */
  box-shadow: var(--phosphor-glow);  /* Glow in retro, none in modern */
}
```

**Benefits:**
- Single component works in both themes
- No theme-specific logic in components
- Easy to add new themes
- Cleaner, more maintainable code

---

## Design System at a Glance

### Colors

| Theme | Primary | Secondary | Highlight | Background |
|-------|---------|-----------|-----------|------------|
| **Retro** | #00ff00 Green | #008800 Dark Green | #66ff66 Light Green | #000000 Black |
| **Modern** | #ffffff White | #b3b3b3 Light Gray | #4a9eff Blue | #1c1c1c Dark Gray |

### Typography

| Theme | Font | Base Size | Character |
|-------|------|-----------|-----------|
| **Retro** | VT323 | 20px | Authentic terminal |
| **Modern** | JetBrains Mono | 14px | Professional code font |

### Spacing

| Token | Retro | Modern | Common Use |
|-------|-------|--------|------------|
| `--spacing-xs` | 4px | 4px | Tight gaps |
| `--spacing-sm` | 8px | 8px | Button vertical |
| `--spacing-md` | 16px | 12px | Button horizontal |
| `--spacing-lg` | 24px | 16px | Section gaps |

### Effects

| Effect | Retro | Modern |
|--------|-------|--------|
| **Phosphor Glow** | ✓ Multi-layer | ✗ None |
| **Scanlines** | ✓ 4% opacity | ✗ None |
| **ASCII Borders** | ✓ Box-drawing | ✗ Solid lines |
| **Animations** | 250ms base | 200ms base |

---

## Common Use Cases

### Implementing a New Component

1. **Check existing patterns** in [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md) Section 6
2. **Use design tokens** from [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md)
3. **Test both themes** using theme switcher
4. **Follow atomic design** - place in correct category (atom/molecule/organism)

### Customizing a Theme

1. **Review token structure** in [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md) Section 2
2. **Override tokens** in theme file:
   ```css
   .app.theme-custom {
     --color-primary: #your-color;
     --font-primary: 'Your Font', monospace;
   }
   ```
3. **Test accessibility** - run contrast checks
4. **Document changes** - add to theme comparison guide

### Adding a New Color

1. **Check if existing token works** - consult [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md)
2. **If truly unique**, add to tokens:
   ```css
   :root {
     --primitive-your-color: #hex;
     --color-your-purpose: var(--primitive-your-color);
   }
   ```
3. **Add to modern theme** if needed
4. **Document usage** in token reference
5. **Check accessibility** - WCAG AA minimum (4.5:1)

---

## Implementation Status

### ✅ Completed

- [x] Design system specification
- [x] Token reference documentation
- [x] Theme comparison guide
- [x] Implementation roadmap
- [x] Color palette analysis (accessibility)
- [x] Component pattern inventory
- [x] Migration strategy

### 🚧 In Progress (Use Roadmap)

- [ ] Token file creation (Phase 1)
- [ ] Component migration (Phases 3-4)
- [ ] Testing infrastructure (Phase 5)
- [ ] Component documentation (Phase 5)

### 📋 Planned (Optional)

- [ ] Package extraction (Phase 6)
- [ ] Storybook integration
- [ ] Visual regression tests
- [ ] npm package publication

---

## Team Responsibilities

### Design Team

- **Review:** Design system specification
- **Maintain:** Token values and semantic meanings
- **Create:** Design specs using tokens
- **Test:** Visual consistency across themes
- **Update:** Documentation when adding tokens

### Engineering Team

- **Implement:** Roadmap phases
- **Migrate:** Components to token-based system
- **Test:** Theme switching, accessibility, visual regression
- **Review:** PRs for token usage compliance
- **Document:** Component APIs and usage

### Product Team

- **Decide:** Which theme to use for different contexts
- **Prioritize:** Component migration order
- **Define:** Use cases and user workflows
- **Communicate:** Design system benefits to stakeholders
- **Plan:** Future theme variations or expansions

---

## Maintenance

### Monthly Reviews

- Review token usage across codebase
- Check for new hard-coded values (code review)
- Update documentation for new patterns
- Run accessibility audits
- Update visual regression baselines

### Quarterly Reviews

- Evaluate theme effectiveness (user feedback)
- Consider new token additions
- Review component patterns for improvements
- Update roadmap for new features
- Publish design system updates

### Continuous

- Code reviews for token compliance
- Accessibility testing in CI/CD
- Visual regression testing
- Documentation updates with new components

---

## FAQs

### Why two themes?

Different use cases require different aesthetics:
- **Retro**: Creative work, performances, visual impact
- **Modern**: Professional production, long sessions, accessibility

### Can I add a third theme?

Yes! Follow the token architecture:
1. Create new theme file: `src/styles/themes/your-theme.css`
2. Override tokens: `.app.theme-your-theme { --color-primary: ...; }`
3. Test all components in new theme
4. Document theme characteristics

### Do I always need to use tokens?

**Almost always**, yes. Only use hard-coded values for:
- Truly one-off, component-specific values
- Values that will never be reused
- Must document why in code comment

### What if a component looks different between themes?

**This is expected!** Components should adapt to each theme's visual language. Key differences:
- Borders: ASCII (retro) vs solid (modern)
- Effects: Glow (retro) vs clean (modern)
- Spacing: May differ slightly between themes

Ensure **functionality** is identical, **appearance** can differ.

### How do I test accessibility?

1. **Contrast:** Use WebAIM Contrast Checker (4.5:1 minimum)
2. **Keyboard:** Tab through all interactive elements
3. **Screen Reader:** Test with NVDA/JAWS/VoiceOver
4. **Motion:** Test with `prefers-reduced-motion`
5. **Automated:** Run axe DevTools or similar

### Where do I ask questions?

1. **Check documentation first** - likely answered here
2. **Search codebase** - find examples of similar usage
3. **Ask team** - in design system Slack channel
4. **Create issue** - for bugs or missing documentation

---

## Version History

### v1.0.0 (2025-10-21)

**Initial Release**
- Complete design system specification
- Token architecture defined
- Both themes documented
- Implementation roadmap created
- Component patterns documented
- Accessibility guidelines established

**Documentation Created:**
- CYCLONE_DESIGN_SYSTEM.md (48 pages)
- DESIGN_TOKENS_REFERENCE.md (35 pages)
- THEME_COMPARISON_GUIDE.md (28 pages)
- DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md (22 pages)

**Deliverables:**
- Token inventory (90+ colors → 15 semantic tokens)
- Spacing scale (4px/8px grid system)
- Typography scales (both themes)
- Component pattern library
- Accessibility audit
- Migration plan

---

## Next Steps

### For New Team Members

1. Read this README
2. Review [CYCLONE_DESIGN_SYSTEM.md](./CYCLONE_DESIGN_SYSTEM.md) Sections 1-3
3. Bookmark [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md) for daily use
4. Read code examples in existing components
5. Ask questions early!

### For Implementation Team

1. Review [DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md](./DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md)
2. Set up project board with Phase 1 tasks
3. Begin token file creation
4. Schedule kickoff meeting
5. Start Phase 1

### For Leadership

1. Review implementation timeline (2-3 weeks)
2. Allocate team resources
3. Approve roadmap phases
4. Define success metrics
5. Plan communication to stakeholders

---

## Resources

### Internal Links

- [Main Specification](./CYCLONE_DESIGN_SYSTEM.md)
- [Token Reference](./DESIGN_TOKENS_REFERENCE.md)
- [Theme Comparison](./THEME_COMPARISON_GUIDE.md)
- [Implementation Roadmap](./DESIGN_SYSTEM_IMPLEMENTATION_ROADMAP.md)

### External Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens W3C Spec](https://design-tokens.github.io/community-group/format/)

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Playwright (Visual Regression)](https://playwright.dev/)

---

## Contact & Support

**Design System Owner:** Design Team
**Technical Lead:** Engineering Team
**Documentation:** This repository

**For questions:**
- Check documentation first
- Create GitHub issue for bugs/improvements
- Slack: #design-system channel

---

## License

MIT License - See LICENSE file for details

---

**Last Updated:** October 21, 2025
**Version:** 1.0.0
**Status:** Specification Complete, Ready for Implementation
