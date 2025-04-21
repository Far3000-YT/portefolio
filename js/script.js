document.addEventListener('DOMContentLoaded', () => {
  const IS_MOBILE_BREAKPOINT = 768;
  let currentScrollIndex = 0;
  let isScrollAnimating = false;
  let isModalVisible = false;
  let scrollAnimationId = null;
  let firstScrollDone = false;
  let mouseX = 0;
  let mouseY = 0;
  let rafIdCursor = null;
  let headerProximityTimeout = null;
  let isPaletteVisible = false;

  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;
  const TOUCH_SWIPE_THRESHOLD_Y = 50;
  const TOUCH_TIME_THRESHOLD = 300;

  const sectionAnimationState = {
    1: { currencyTimeoutId: null },
    3: { currencyTimeoutId: null }
  };

  const SCROLL_ANIMATION_DURATION = 1200;
  const HEADER_PROXIMITY_THRESHOLD = 150;
  const HEADER_PROXIMITY_DEBOUNCE = 50;

  const CURRENCY_SPAWN_INTERVAL = [400, 600];
  const CURRENCY_ANIMATION_DURATION = [2500, 5000];

  const selectors = {
    body: document.body,
    htmlElement: document.documentElement,
    siteHeader: document.querySelector('.site-header'),
    scrollContainer: document.querySelector('.scroll-container'),
    sections: Array.from(document.querySelectorAll('.scroll-section')),
    navLinks: document.querySelectorAll('.main-nav a[href^="#"], .logo a[href^="#"], .hero-cta.scroll-link'),
    scrollIndicator: document.querySelector('.scroll-indicator'),
    themeToggleButton: document.getElementById('theme-toggle'),
    colorPaletteToggleButton: document.getElementById('color-palette-toggle'),
    colorPaletteDropdown: document.getElementById('color-palette-dropdown'),
    colorChoiceButtons: null,
    cursorDot: document.getElementById('cursor-dot'),
    backgroundLight: document.getElementById('background-light'),
    interactiveElements: document.querySelectorAll('a, button, .project-card, .modal-close-button, .header-button, [role="button"]'),
    modalOverlay: document.getElementById('project-modal'),
    modalContent: document.querySelector('#project-modal .modal-content'),
    modalCloseButton: document.querySelector('#project-modal .modal-close-button'),
    projectCards: document.querySelectorAll('.project-card'),
    modalElements: {
      image: null,
      title: null,
      description: null,
      featuresList: null,
      tagsContainer: null,
      githubLink: null,
      otherLink: null,
      otherLinkText: null
    }
  };

  const projectData = {
    "proj-mgmt-app": {
      title: "Full-Stack Project Management Desktop App",
      imgSrc: "images/javafx-app.png",
      imgAlt: "Screenshot of the JavaFX App",
      description: "A comprehensive full-stack desktop application designed for project management and team collaboration. This application features a rich JavaFX client providing an intuitive user interface for managing projects, tasks, and employees, powered by a dedicated Spring Boot REST API backend for robust data handling and business logic. Developed collaboratively by a team of three.",
      features: [
        "Project Management: Full CRUD operations for projects, including setting descriptions, deadlines, and priorities.",
        "Task Tracking: Create, update, and delete tasks within projects; assign tasks to employees, set priorities, due dates, and manage statuses (Todo, In Progress, Done).",
        "Employee Management: Add, view, edit, and delete team members.",
        "Team Collaboration: Assign employees to specific projects with defined roles.",
        "Visual Workflow: Interactive Kanban board view visualizing task progress for the selected project.",
        "User Authentication: Secure user login and signup functionality integrated with the backend API.",
        "RESTful Architecture: Seamless communication between the JavaFX client and the Spring Boot backend via HTTP requests using Apache HttpClient and Jackson for JSON parsing."
      ],
      tags: [
        "Java", "JavaFX", "Spring Boot", "REST API", "Apache HttpClient", "Jackson", "Maven", "Docker", "Client-Server", "SQL"
      ],
      githubLink: "https://github.com/Far3000-YT/project-management-app",
      otherLink: "https://github.com/Far3000-YT/project-management-app-api",
      otherLinkText: "Backend API"
    },
    "ptap": {
      title: "PTAP - Project To AI Prompt Utility",
      imgSrc: "images/project-ptap.png",
      imgAlt: "PTAP CLI + browser (Google AI Studio) demo",
      description: "A popular Python CLI utility (>500 PyPI downloads) designed to bridge the gap between complex codebases and AI language models. PTAP automates the tedious process of gathering project structure and relevant code files, generating a single, comprehensive, and well-formatted prompt optimized for AI analysis, debugging, or documentation tasks.",
      features: [
        "Automated Prompt Generation: Scans local project directories or clones public GitHub repositories.",
        "Intelligent Code Aggregation: Includes directory structure (JSON) and relevant source file content.",
        "Robust File Handling: Recursive traversal, various file types, encoding handling.",
        "Highly Customizable: Folder exclusions, configurable intro/title text, file inclusion rules.",
        "Flexible Output: Copies prompt to clipboard or saves to file.",
        "Secure & Local: Runs entirely on the user's machine.",
        "GitHub Integration: Directly analyzes public repositories using Git."
      ],
      tags: [
        "Python", "CLI", "PyPI", "File I/O", "Automation", "AI Tooling", "argparse", "requests", "pyperclip", "Git"
      ],
      githubLink: "https://github.com/Far3000-YT/PTAP",
      otherLink: "https://pypi.org/project/ptap/",
      otherLinkText: "PyPI"
    },
     "dont-click": {
        title: "Don't Click! - Email Security Browser Extension",
        imgSrc: "images/project-dont-click.png",
        imgAlt: "Screenshot of Don't Click Extension UI in Gmail",
        description: "A browser extension developed during the Silicon Days Hackathon (in partnership with Capgemini) designed to enhance email security by providing real-time analysis directly within Gmail and Outlook web interfaces. This tool combines comprehensive local scanning rules with optional AI-powered analysis (Google Gemini) to help users detect phishing attempts, visualize potential risks, and make informed decisions before clicking. Collaboratively built by a team of four.",
        features: [
          "Real-time Scanning: Analyzes emails automatically in supported webmail clients.",
          "Multi-faceted Local Analysis: 20+ indicators (sender, links, content, structure).",
          "AI-Powered Second Opinion: Optional Google Gemini integration for deeper analysis.",
          "Visual Risk Indicators: Color-coded risk score and detailed breakdown.",
          "Contextual Highlighting: Highlights suspicious elements directly in the email.",
          "Cross-Platform Compatibility: Works with Gmail and Outlook webmail.",
          "Privacy-Focused: Primary analysis is local; AI analysis is optional."
        ],
        tags: [
           "JavaScript", "Chrome Extension", "Browser API", "HTML/CSS", "DOM Manipulation", "Security", "AI Integration", "Google Gemini API", "Hackathon"
        ],
        githubLink: "https://github.com/SnowZucc/DontClick",
        otherLink: "",
        otherLinkText: ""
    },
    "sde-sim": {
      title: "Stochastic Differential Equation (SDE) Simulation and Financial Analysis",
      imgSrc: "images/project-sde-sim.png",
      imgAlt: "Plots (from several days), with vectorized simulations, a heatmap... etc",
      description: "A Python-based project focused on the simulation, numerical analysis, and financial application of key Stochastic Differential Equations (SDEs). This work implements various SDE models, compares the accuracy and convergence properties of different numerical simulation schemes (Euler-Maruyama vs. Milstein), and applies these tools to practical financial problems including option pricing, parameter estimation, and strategy backtesting.",
      features: [
        "SDE Model Implementation: GBM, OU, CIR, Merton Jump-Diffusion.",
        "Numerical Methods: Euler-Maruyama (EM) and Milstein schemes.",
        "Convergence Analysis: Tested and visualized strong & weak convergence.",
        "Validation: Compared simulations against analytical solutions.",
        "Monte Carlo Option Pricing: Priced European options (GBM vs. Black-Scholes).",
        "Parameter Estimation: Implemented Maximum Likelihood Estimation (MLE) for OU process.",
        "Strategy Backtesting: Basic vectorized framework (DMA crossover on SPY)."
      ],
      tags: [
        "Python", "NumPy", "SciPy", "Pandas", "Matplotlib", "Seaborn", "Quant Finance", "SDE", "Monte Carlo", "Backtesting", "yfinance"
      ],
      githubLink: "https://github.com/Far3000-YT/SDE-Simulation-Analysis",
      otherLink: "",
      otherLinkText: ""
    },
    "ai-responder": {
        title: "AI Responder Background Tool",
        imgSrc: "images/project-ai-responder.png",
        imgAlt: "Screenshot of AI Responder being used.",
        description: "A Python-based background utility designed for personal use, enabling quick interactions with the Google Gemini API based on screen content or clipboard text. Triggered entirely by configurable keyboard shortcuts, this tool captures screen regions or reads clipboard content, sends it to the Gemini API, and places the AI's response back onto the clipboard, minimizing workflow interruption. Features a minimalist visual indicator to show processing status.",
        features: [
          "Gemini API Integration: Text/image analysis, configurable models/parameters.",
          "Screenshot Capture: Select screen region via hotkey/mouse (`pyautogui`).",
          "Clipboard Processing: Process clipboard text via hotkey (`pyperclip`).",
          "Hotkey Driven: Core functionality via keyboard shortcuts (`keyboard`).",
          "Background Operation: Runs unobtrusively using threading.",
          "Visual Status Indicator: Tiny always-on-top window (`tkinter`) shows Ready/Busy.",
          "Configurable: Settings via YAML (`config.yaml`) for prompts, hotkeys, API options.",
          "API Key Management: Loads keys from `.env`, supports alternating keys.",
          "Cross-Platform Setup: Includes `.bat`/`.sh` scripts for setup."
        ],
        tags: [
            "Python", "AI", "Google Gemini API", "Automation", "GUI (Tkinter)", "CLI Tools", "pyautogui", "pyperclip", "keyboard", "YAML", "Threading", "Background Process"
        ],
        githubLink: "https://github.com/Far3000-YT/AI-Responder-BgProcess",
        otherLink: "",
        otherLinkText: ""
    },
    "tender-response": {
        title: "Automated Tender Response System (Junior Enterprise Project)",
        imgSrc: "images/juniorisep.png",
        imgAlt: "Automated Tender Response System Interface",
        description: "Developed and significantly refactored a backend system for a Junior ISEP client project to automate the generation of responses to French public tenders. My role involved taking initiative to enhance system robustness, implement core AI-driven document generation features, and improve the overall processing pipeline.",
        features: [
          "AI-Powered Document Generation: Implemented the core module using the Google Gemini API to generate tailored technical proposal sections based on analyzed tender requirements.",
          "Backend Refactoring & Enhancement: Reworked major parts of the existing backend, introducing comprehensive logging, robust error handling, state management, and fixing numerous bugs.",
          "Document Processing & Integration: Integrated various libraries for parsing, generating, converting, and assembling complex tender-specific documents.",
          "Google Drive Monitoring: System watches a designated Google Drive folder for new tender inputs.",
          "Automated Processing Pipeline: Utilized background tasks (Supervisord) to download, extract, and process tender documents.",
          "Document Analysis: Leveraged LLMs (Gemini) and rule-based logic to extract key information from tender documents.",
          "Flask Web Interface: Provided UI for monitoring, validation, settings management, logs, and Google OAuth.",
          "Deployment Ready: Configured for containerized deployment using Docker, Docker Compose, and GitLab CI/CD.",
          "Improved Reliability: Focused on making the background processing tasks more stable and maintainable."
        ],
        tags: [
            "Python", "Flask", "SQLAlchemy", "MySQL", "Google Drive API", "Google Gemini API", "AI", "LLM", "Document Processing", "python-docx", "lxml", "PyMuPDF", "Supervisord", "Docker", "GitLab CI/CD", "OAuth", "Refactoring"
        ],
        githubLink: "",
        otherLink: "",
        otherLinkText: ""
    }
  };

  function isMobile() {
      return window.innerWidth <= IS_MOBILE_BREAKPOINT;
  }

  function getRandomNumber(min, max) {
      return Math.random() * (max - min) + min;
  }

  function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
  }

  function initializeApp() {
    setupThemeSwitcher();
    setupColorChooser();
    setupScrollManager();
    setupCursorAndLight();
    setupHeaderProximity();
    setupBackgroundAnimations();
    setupModal();

    document.addEventListener('click', handleGlobalClick);

    if (isMobile()) {
        selectors.body.classList.add('is-mobile');
        selectors.siteHeader?.style.setProperty('animation', 'none', 'important');
    } else {
         selectors.body.classList.remove('is-mobile');
         selectors.siteHeader?.style.removeProperty('animation');
    }

    window.addEventListener('resize', () => {
        clearTimeout(selectors.scrollContainer.__resizeTimeout);
        selectors.scrollContainer.__resizeTimeout = setTimeout(() => {
            const isCurrentlyMobile = isMobile();
            const wasMobile = selectors.body.classList.contains('is-mobile');

            if (wasMobile !== isCurrentlyMobile) {
                selectors.body.classList.toggle('is-mobile', isCurrentlyMobile);
                setupCursorAndLight();
                setupHeaderProximity();
                if (isCurrentlyMobile) {
                     selectors.siteHeader?.style.setProperty('animation', 'none', 'important');
                } else {
                    selectors.siteHeader?.style.removeProperty('animation');
                }
            }

            updateScrollVisibility();

        }, 200);
    });
  }

  function setupThemeSwitcher() {
    if (!selectors.themeToggleButton) {
      return;
    }
    applyInitialTheme();
    selectors.themeToggleButton.addEventListener('click', toggleTheme);
  }

  function applyTheme(theme) {
    if (theme) {
      selectors.htmlElement.setAttribute('data-theme', theme);
    }
  }

  function applyInitialTheme() {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(storedTheme);
  }

  function toggleTheme() {
    const currentTheme = selectors.htmlElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(targetTheme);
    localStorage.setItem('theme', targetTheme);
  }

  function setupColorChooser() {
    if (!selectors.colorPaletteToggleButton || !selectors.colorPaletteDropdown) {
      return;
    }

    selectors.colorChoiceButtons = selectors.colorPaletteDropdown.querySelectorAll('.color-choice-button');
    if (selectors.colorChoiceButtons.length === 0) {
       return;
    }

    applyInitialAccentColor();

    selectors.colorPaletteToggleButton.addEventListener('click', toggleColorPalette);
    selectors.colorPaletteDropdown.addEventListener('click', handleColorChoice);
  }

  function toggleColorPalette(event) {
    event.stopPropagation();
    isPaletteVisible = !isPaletteVisible;
    selectors.siteHeader?.classList.toggle('palette-visible', isPaletteVisible);
    selectors.colorPaletteToggleButton?.setAttribute('aria-expanded', isPaletteVisible);
    selectors.colorPaletteDropdown?.setAttribute('aria-hidden', !isPaletteVisible);
  }

  function closeColorPalette() {
    if (isPaletteVisible) {
      isPaletteVisible = false;
      selectors.siteHeader?.classList.remove('palette-visible');
      selectors.colorPaletteToggleButton?.setAttribute('aria-expanded', 'false');
      selectors.colorPaletteDropdown?.setAttribute('aria-hidden', 'true');
    }
  }

  function applyAccentColor(colorName) {
    if (!colorName) {
      return;
    }
    selectors.htmlElement.setAttribute('data-accent-color', colorName);
    selectors.colorChoiceButtons?.forEach(button => {
      button.classList.toggle('active', button.dataset.color === colorName);
    });
  }

  function applyInitialAccentColor() {
    const storedColor = localStorage.getItem('accentColor');
    const validColors = ['gold', 'teal', 'emerald', 'navy'];
    const defaultColor = 'gold';
    const initialColor = (storedColor && validColors.includes(storedColor)) ? storedColor : defaultColor;
    applyAccentColor(initialColor);
  }

  function handleColorChoice(event) {
    const button = event.target.closest('.color-choice-button');
    if (!button) {
      return;
    }
    const chosenColor = button.dataset.color;
    const validColors = ['gold', 'teal', 'emerald', 'navy'];
    if (chosenColor && validColors.includes(chosenColor)) {
      applyAccentColor(chosenColor);
      localStorage.setItem('accentColor', chosenColor);
      closeColorPalette();
    }
  }


  function setupCursorAndLight() {
    const customCursorActive = !isMobile() && selectors.cursorDot && selectors.backgroundLight;
    const mobileLightActive = isMobile() && selectors.backgroundLight;


    selectors.body.classList.toggle('custom-cursor-active', customCursorActive);

    document.removeEventListener('mousemove', handleMouseMoveForEffects);
    document.documentElement.removeEventListener('mouseleave', handleMouseLeaveEffects);
    document.documentElement.removeEventListener('mouseenter', handleMouseEnterEffects);
    selectors.interactiveElements?.forEach(el => {
       el.removeEventListener('mouseenter', handleMouseEnterInteractive);
       el.removeEventListener('mouseleave', handleMouseLeaveInteractive);
    });
    if (rafIdCursor) {
       cancelAnimationFrame(rafIdCursor);
       rafIdCursor = null;
    }

    if (customCursorActive) {
       selectors.cursorDot.style.display = '';
       selectors.backgroundLight.style.display = '';
       selectors.backgroundLight.classList.remove('is-mobile-animated');

       document.addEventListener('mousemove', handleMouseMoveForEffects, { passive: true });
       document.documentElement.addEventListener('mouseleave', handleMouseLeaveEffects);
       document.documentElement.addEventListener('mouseenter', handleMouseEnterEffects);
       selectors.interactiveElements?.forEach(el => {
         el.addEventListener('mouseenter', handleMouseEnterInteractive);
         el.addEventListener('mouseleave', handleMouseLeaveInteractive);
       });

       if (!rafIdCursor) {
         rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
       }

    } else if (mobileLightActive) {
       selectors.cursorDot?.style.setProperty('display', 'none', 'important');
       selectors.backgroundLight.style.display = '';
       selectors.backgroundLight.classList.add('is-mobile-animated');

       if (selectors.backgroundLight) {
            selectors.backgroundLight.style.removeProperty('transform');
       }

    } else {
      selectors.cursorDot?.style.setProperty('display', 'none', 'important');
      selectors.backgroundLight?.style.setProperty('display', 'none', 'important');
       selectors.backgroundLight?.classList.remove('is-mobile-animated');
    }
  }

  function handleMouseEnterInteractive() {
      if (!isMobile()) {
         selectors.cursorDot?.classList.add('hover');
      }
  }

  function handleMouseLeaveInteractive() {
       if (!isMobile()) {
          selectors.cursorDot?.classList.remove('hover');
       }
  }

  function handleMouseMoveForEffects(event) {
    if (isMobile()) return;

    mouseX = event.clientX;
    mouseY = event.clientY;

    if (selectors.cursorDot && !selectors.cursorDot.classList.contains('visible')) {
      selectors.cursorDot.classList.add('visible');
    }
    if (selectors.backgroundLight && !selectors.backgroundLight.classList.contains('visible')) {
      selectors.backgroundLight.classList.add('visible');
    }

    if (!rafIdCursor) {
      rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
    }
  }

  function updateCursorAndLightPosition() {
    if (isMobile() || !selectors.cursorDot || !selectors.backgroundLight) {
        rafIdCursor = null;
        return;
    }

    selectors.cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(${selectors.cursorDot.classList.contains('hover') ? selectors.cursorDot.style.getPropertyValue('--cursor-dot-hover-scale') || 1.5 : 1})`;


    selectors.backgroundLight.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
  }

  function handleMouseLeaveEffects() {
     if (!selectors.cursorDot || !selectors.backgroundLight || isMobile()) return;
    selectors.cursorDot.classList.remove('visible', 'hover');
    selectors.backgroundLight.classList.remove('visible');
  }

  function handleMouseEnterEffects() {
     if (!selectors.cursorDot || !selectors.backgroundLight || isMobile()) return;
     if (!selectors.cursorDot.classList.contains('visible')) {
        selectors.cursorDot.classList.add('visible');
     }
     if (!selectors.backgroundLight.classList.contains('visible')) {
        selectors.backgroundLight.classList.add('visible');
     }
     if (!rafIdCursor) {
        rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
     }
  }


  function setupHeaderProximity() {
     if (isMobile() || !selectors.siteHeader || !selectors.scrollContainer) {
       selectors.siteHeader?.classList.remove('header-nearby');
       clearTimeout(headerProximityTimeout);
       selectors.scrollContainer?.removeEventListener('mousemove', handleHeaderProximityWrapper);
       selectors.scrollContainer?.removeEventListener('mouseleave', handleMouseLeaveHeaderProximity);
       return;
    }

    selectors.scrollContainer.removeEventListener('mousemove', handleHeaderProximityWrapper);
    selectors.scrollContainer.addEventListener('mousemove', handleHeaderProximityWrapper, { passive: true });

    selectors.scrollContainer.removeEventListener('mouseleave', handleMouseLeaveHeaderProximity);
    selectors.scrollContainer.addEventListener('mouseleave', handleMouseLeaveHeaderProximity);
  }

  function handleHeaderProximityWrapper(event) {
      handleHeaderProximity(event.clientX, event.clientY);
  }

  function handleMouseLeaveHeaderProximity() {
      clearTimeout(headerProximityTimeout);
      selectors.siteHeader?.classList.remove('header-nearby');
  }

  function handleHeaderProximity(x, y) {
    if (isMobile() || x === -1 || y === -1 || !selectors.siteHeader) return;
    clearTimeout(headerProximityTimeout);
    headerProximityTimeout = setTimeout(() => {
      const rect = selectors.siteHeader.getBoundingClientRect();
      const isNear = (
        x >= rect.left - HEADER_PROXIMITY_THRESHOLD &&
        x <= rect.right + HEADER_PROXIMITY_THRESHOLD &&
        y >= rect.top - HEADER_PROXIMITY_THRESHOLD &&
        y <= rect.bottom + HEADER_PROXIMITY_THRESHOLD + 50
      );
      selectors.siteHeader.classList.toggle('header-nearby', isNear);
    }, HEADER_PROXIMITY_DEBOUNCE);
  }


  function setupScrollManager() {
    if (!selectors.scrollContainer || selectors.sections.length === 0) {
      selectors.sections.forEach(sec => sec.classList.add('is-visible'));
      if (selectors.scrollIndicator) {
        selectors.scrollIndicator.style.display = 'none';
      }
      selectors.htmlElement.style.overflow = '';
      selectors.body.style.overflow = '';
      selectors.scrollContainer.style.overflowY = '';
      selectors.scrollContainer.style.scrollBehavior = '';
      return;
    }

    selectors.scrollContainer.scrollTop = 0;
    currentScrollIndex = 0;
    selectors.htmlElement.style.overflow = 'hidden';
    selectors.body.style.overflow = 'hidden';
    selectors.scrollContainer.style.overflowY = 'scroll';
    selectors.scrollContainer.style.scrollBehavior = 'auto';

    requestAnimationFrame(() => {
        setTimeout(updateScrollVisibility, 50);
    });

    selectors.scrollContainer.addEventListener('wheel', handleWheelScroll, { passive: false });
    document.addEventListener('keydown', handleKeydownScroll);
    selectors.scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    selectors.scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    selectors.scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

    selectors.navLinks.forEach(link => link.addEventListener('click', handleNavLinkScroll));

    selectors.scrollContainer.addEventListener('scroll', () => {
        closeColorPalette();
        updateScrollVisibility();
    }, { passive: true });
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateScroll(targetScrollTop) {
    if (isScrollAnimating && Math.abs(selectors.scrollContainer.scrollTop - targetScrollTop) < 5) {
        return;
    }
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
    }

    isScrollAnimating = true;
    closeColorPalette();

    const startScrollTop = selectors.scrollContainer.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    let startTime = null;

    const step = (currentTime) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / SCROLL_ANIMATION_DURATION, 1);
      const easedProgress = easeInOutCubic(progress);

      selectors.scrollContainer.scrollTop = startScrollTop + distance * easedProgress;

      if (elapsedTime < SCROLL_ANIMATION_DURATION) {
        scrollAnimationId = requestAnimationFrame(step);
      } else {
        selectors.scrollContainer.scrollTop = targetScrollTop;
        isScrollAnimating = false;
        scrollAnimationId = null;
        updateScrollVisibility();
      }
    };

    scrollAnimationId = requestAnimationFrame(step);
  }

  function scrollToSection(index) {
    index = clamp(index, 0, selectors.sections.length - 1);

     if (index === currentScrollIndex && !isScrollAnimating) {
        updateScrollVisibility();
        return;
    }

    const targetSection = selectors.sections[index];
    if (!targetSection) {
      console.error(`Section at index ${index} not found.`);
      return;
    }

    handleSectionBackgroundAnimations(currentScrollIndex, 'stop');

    currentScrollIndex = index;
    updateScrollVisibility();

    const targetScrollTop = targetSection.offsetTop;
    animateScroll(targetScrollTop);
  }

  function updateScrollVisibility() {
    const containerHeight = selectors.scrollContainer.clientHeight;
    const scrollTop = selectors.scrollContainer.scrollTop;
    let determinedIndex = currentScrollIndex;
    let minDistance = Infinity;

    selectors.sections.forEach((section, idx) => {
      const sectionTop = section.offsetTop;
      const distance = Math.abs(scrollTop - sectionTop);

       const sectionBottom = sectionTop + section.offsetHeight;
       const containerBottom = scrollTop + containerHeight;

       const isEnteringOrLeaving = (sectionTop < containerBottom && sectionBottom > scrollTop);

       if (isEnteringOrLeaving) {
            if (distance < minDistance) {
                 minDistance = distance;
                 determinedIndex = idx;
            }
       }
    });

     determinedIndex = clamp(determinedIndex, 0, selectors.sections.length - 1);


    selectors.sections.forEach((section, idx) => {
      const isCurrent = idx === determinedIndex;
      section.classList.toggle('is-visible', isCurrent);

      if (!isCurrent) {
         handleSectionBackgroundAnimations(idx, 'stop');
      }
    });

    if (!isScrollAnimating) {
         handleSectionBackgroundAnimations(determinedIndex, 'start');
    }

    updateActiveNavLink(determinedIndex);

     if (!isScrollAnimating && currentScrollIndex !== determinedIndex) {
         currentScrollIndex = determinedIndex;
     }

    checkFirstScroll();
  }

   function updateActiveNavLink(activeSectionIndex) {
        const currentSectionId = selectors.sections[activeSectionIndex]?.id;
        if (!currentSectionId) return;

        selectors.navLinks?.forEach(link => {
            const linkHref = link.getAttribute('href');
            const linkTargetId = (linkHref === '#' || linkHref === '#hero') ? 'hero' : linkHref?.replace('#', '');
            link.classList.toggle('active-nav-link', linkTargetId && linkTargetId === currentSectionId);
        });
    }

  function checkFirstScroll() {
    if (!firstScrollDone && currentScrollIndex > 0 && selectors.scrollIndicator) {
      selectors.body.classList.add('has-scrolled');
      firstScrollDone = true;
    }
  }

  function handleWheelScroll(event) {
     if (isModalVisible || isPaletteVisible) {
         const scrollableContent = isModalVisible ? selectors.modalContent : selectors.colorPaletteDropdown;
         if (scrollableContent?.contains(event.target)) {
            const isScrollable = scrollableContent.scrollHeight > scrollableContent.clientHeight;
            const atTop = event.deltaY < 0 && scrollableContent.scrollTop <= 1;
            const atBottom = event.deltaY > 0 && scrollableContent.scrollTop >= (scrollableContent.scrollHeight - scrollableContent.clientHeight - 1);
             if (isScrollable && (!atTop || event.deltaY > 0) && (!atBottom || event.deltaY < 0)) {
                return;
             }
         }
        event.preventDefault();
    } else {
        event.preventDefault();
    }

    if (isScrollAnimating) {
      return;
    }

    const direction = event.deltaY > 0 ? 'down' : 'up';
    let targetIndex = currentScrollIndex;
    if (direction === 'down' && currentScrollIndex < selectors.sections.length - 1) {
      targetIndex++;
    } else if (direction === 'up' && currentScrollIndex > 0) {
      targetIndex--;
    }

    if (targetIndex !== currentScrollIndex) {
      scrollToSection(targetIndex);
    }
  }

   function handleTouchStart(event) {
      if (isModalVisible || isPaletteVisible) {
          return;
      }
      if (event.touches.length === 1) {
          touchStartY = event.touches[0].clientY;
          touchStartX = event.touches[0].clientX;
          touchStartTime = Date.now();
      }
   }

   function handleTouchMove(event) {
       if (isModalVisible || isPaletteVisible || isScrollAnimating) {
           return;
       }
       const deltaY = event.touches[0].clientY - touchStartY;
       const deltaX = event.touches[0].clientX - touchStartX;

        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
             event.preventDefault();
        }
   }

   function handleTouchEnd(event) {
       if (isModalVisible || isPaletteVisible || isScrollAnimating) {
           return;
       }
       const endY = event.changedTouches[0].clientY;
       const endTime = Date.now();
       const swipeDistanceY = endY - touchStartY;
       const swipeTime = endTime - touchStartTime;

       let targetIndex = currentScrollIndex;
       let shouldScroll = false;

       const isFastSwipe = Math.abs(swipeDistanceY) > 10 && swipeTime < TOUCH_TIME_THRESHOLD;
       const isLongSwipe = Math.abs(swipeDistanceY) > TOUCH_SWIPE_THRESHOLD_Y;

       if (isFastSwipe || isLongSwipe) {
           if (swipeDistanceY < 0) {
               if (currentScrollIndex < selectors.sections.length - 1) {
                   targetIndex++;
                   shouldScroll = true;
               }
           } else if (swipeDistanceY > 0) {
               if (currentScrollIndex > 0) {
                   targetIndex--;
                   shouldScroll = true;
               }
           }
       }

       if (shouldScroll && targetIndex !== currentScrollIndex) {
           scrollToSection(targetIndex);
       }

       touchStartY = 0;
       touchStartX = 0;
       touchStartTime = 0;
   }

  function handleKeydownScroll(event) {
    if (isModalVisible) {
        if (event.key === 'Escape') {
             closeModal();
             event.preventDefault();
        }
        if (['ArrowUp', 'ArrowDown', ' ', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
             event.preventDefault();
        }
        return;
    }

    if (isPaletteVisible) {
        if (event.key === 'Escape') {
            closeColorPalette();
            event.preventDefault();
        }
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
         }
         return;
    }

    if (isScrollAnimating || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
      return;
    }

    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
    if (isInput) {
      return;
    }

    let targetIndex = currentScrollIndex;
    let shouldScroll = false;
    let preventDefault = false;

    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
        if (currentScrollIndex < selectors.sections.length - 1) {
          targetIndex++;
          shouldScroll = true;
           preventDefault = true;
        } else {
             preventDefault = true;
        }
        break;
      case ' ':
        if (currentScrollIndex < selectors.sections.length - 1) {
           targetIndex++;
           shouldScroll = true;
           preventDefault = true;
        } else {
             preventDefault = false;
        }
        break;
      case 'ArrowUp':
      case 'PageUp':
        if (currentScrollIndex > 0) {
          targetIndex--;
          shouldScroll = true;
           preventDefault = true;
        } else {
            preventDefault = true;
        }
        break;
      case 'Home':
        if (currentScrollIndex !== 0) {
          targetIndex = 0;
          shouldScroll = true;
          preventDefault = true;
        }
        break;
      case 'End':
        if (currentScrollIndex !== selectors.sections.length - 1) {
          targetIndex = selectors.sections.length - 1;
          shouldScroll = true;
          preventDefault = true;
        }
        break;
      default:
        return;
    }

    if (shouldScroll) {
      scrollToSection(targetIndex);
    }
    if (preventDefault) {
      event.preventDefault();
    }
  }

  function handleNavLinkScroll(event) {
    event.preventDefault();
    if (isScrollAnimating) {
      return;
    }

    const targetId = event.currentTarget.getAttribute('href');
    try {
      if (!targetId || targetId === '#') {
         scrollToSection(0);
         return;
      }

      const targetElementId = targetId.replace('#', '');
      const targetElement = document.getElementById(targetElementId);

      if (!targetElement) {
        console.error(`Target element "${targetId}" not found.`);
        return;
      }

      const targetIndex = selectors.sections.findIndex(sec => sec.id === targetElement.id);

      if (targetIndex !== -1) {
        scrollToSection(clamp(targetIndex, 0, selectors.sections.length - 1));
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
        console.error("Error handling navigation link:", error);
    }
  }


  function setupBackgroundAnimations() {
      stopAllBackgroundAnimations();
  }

  function handleSectionBackgroundAnimations(sectionIndex, action) {
      if (isModalVisible) {
          stopAllBackgroundAnimations();
          return;
      }

      const state = sectionAnimationState[sectionIndex];
      if (!state) return;

      if (action === 'start') {
           if (state.currencyTimeoutId === null) {
               startSectionAnimations(sectionIndex);
           }
      } else if (action === 'stop') {
           if (state.currencyTimeoutId !== null) {
               stopSectionAnimations(sectionIndex);
           }
      }
  }

  function startSectionAnimations(sectionIndex) {
      if (isModalVisible) return;
      const sectionElement = selectors.sections[sectionIndex];
      if (!sectionElement) return;
      const state = sectionAnimationState[sectionIndex];
      if (!state || state.currencyTimeoutId !== null) return;

      const animatedShapesContainer = sectionElement.querySelector('.animated-shapes');
      if (!animatedShapesContainer) {
          return;
      }

      clearTimeout(state.currencyTimeoutId);

      const scheduleNextSpawn = () => {
             if (!isModalVisible && selectors.sections[currentScrollIndex]?.id === sectionElement.id) {
                 const delay = getRandomInt(CURRENCY_SPAWN_INTERVAL[0], CURRENCY_SPAWN_INTERVAL[1]);
                 state.currencyTimeoutId = setTimeout(() => {
                     spawnCurrencySymbol(animatedShapesContainer);
                     scheduleNextSpawn();
                 }, delay);
             } else {
                  state.currencyTimeoutId = null;
             }
        };

        const firstDelay = getRandomInt(100, CURRENCY_SPAWN_INTERVAL[0]);
         state.currencyTimeoutId = setTimeout(() => {
            if (!isModalVisible && selectors.sections[currentScrollIndex]?.id === sectionElement.id) {
                spawnCurrencySymbol(animatedShapesContainer);
                scheduleNextSpawn();
            } else {
                state.currencyTimeoutId = null;
            }
         }, firstDelay);
  }

  function stopSectionAnimations(sectionIndex) {
       const state = sectionAnimationState[sectionIndex];
       if (!state || state.currencyTimeoutId === null) return;

       clearTimeout(state.currencyTimeoutId);
       state.currencyTimeoutId = null;

       const sectionElement = selectors.sections[sectionIndex];
        if(sectionElement) {
           const animatedShapesContainer = sectionElement.querySelector('.animated-shapes');
           if(animatedShapesContainer) {
               animatedShapesContainer.querySelectorAll('.currency-symbol').forEach(symbol => symbol.remove());
           }
       }
  }

  function stopAllBackgroundAnimations() {
      Object.keys(sectionAnimationState).forEach(indexStr => {
          stopSectionAnimations(parseInt(indexStr, 10));
      });
      selectors.sections.forEach(section => {
           const animatedShapesContainer = section.querySelector('.animated-shapes');
            if(animatedShapesContainer) {
               animatedShapesContainer.querySelectorAll('.currency-symbol').forEach(symbol => symbol.remove());
           }
      });
  }

  const CURRENCY_SYMBOLS = ['$', '€', '€', '₮', '₿', '₿', '₿', '₿', '⟠', '⟠', '⟠', '$', '$', '$', 'Ψ', 'ϑ'];

  function spawnCurrencySymbol(containerElement) {
      if (isModalVisible || !containerElement) return;

      const symbolEl = document.createElement('span');
      symbolEl.classList.add('currency-symbol');
      symbolEl.textContent = CURRENCY_SYMBOLS[getRandomInt(0, CURRENCY_SYMBOLS.length - 1)];

      const startX = getRandomNumber(10, 90);
      const startY = getRandomNumber(10, 90);
      symbolEl.style.position = 'absolute';
      symbolEl.style.left = `${startX}%`;
      symbolEl.style.top = `${startY}%`;

      const animDuration = getRandomInt(CURRENCY_ANIMATION_DURATION[0], CURRENCY_ANIMATION_DURATION[1]);
      const floatX = (startX > 50 ? -1 : 1) * getRandomNumber(20, 60);
      const floatY = (startY > 50 ? -1 : 1) * getRandomNumber(40, 80);
      const floatRotate = getRandomNumber(-30, 30);

      symbolEl.style.setProperty('--float-x', `${floatX}px`);
      symbolEl.style.setProperty('--float-y', `${floatY}px`);
      symbolEl.style.setProperty('--float-rotate', `${floatRotate}deg`);

      containerElement.appendChild(symbolEl);

      requestAnimationFrame(() => {
          setTimeout(() => {
             symbolEl.style.animation = `floatFade ${animDuration}ms ease-out forwards`;
          }, 10);
      });

      symbolEl.addEventListener('animationend', () => {
          symbolEl.remove();
      }, { once: true });
  }


  function setupModal() {
    if (!selectors.modalOverlay || !selectors.modalContent || !selectors.modalCloseButton || selectors.projectCards.length === 0) {
      selectors.modalOverlay?.remove();
      console.warn("Modal elements or project cards not found, modal functionality disabled.");
      return;
    }

    selectors.modalElements.image = selectors.modalOverlay.querySelector('.modal-project-image');
    selectors.modalElements.title = selectors.modalOverlay.querySelector('#modal-project-title');
    selectors.modalElements.description = selectors.modalOverlay.querySelector('.modal-project-description');
    selectors.modalElements.featuresList = selectors.modalOverlay.querySelector('.modal-project-features');
    selectors.modalElements.tagsContainer = selectors.modalOverlay.querySelector('.modal-project-tags');
    selectors.modalElements.githubLink = selectors.modalOverlay.querySelector('.modal-project-link-button.github');
    selectors.modalElements.otherLink = selectors.modalOverlay.querySelector('.modal-project-link-button.other');
    selectors.modalElements.otherLinkText = selectors.modalOverlay.querySelector('.other-link-text');

     if (!selectors.modalElements.title || !selectors.modalElements.description || !selectors.modalElements.image || !selectors.modalElements.featuresList || !selectors.tagsContainer || !selectors.modalElements.githubLink || !selectors.modalElements.otherLink || !selectors.modalElements.otherLinkText) {
         console.error("Some required modal child elements not found, modal functionality may be limited or broken.");
     }


    selectors.projectCards.forEach(card => {
      const projectId = card.dataset.projectId;
      if (projectId && projectData[projectId]) {
        card.addEventListener('click', () => openModal(projectId));
        card.tabIndex = 0;
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(projectId);
          }
        });
        card.setAttribute('role', 'button');
        card.setAttribute('aria-haspopup', 'dialog');
      } else {
         card.style.cursor = 'default';
         card.tabIndex = -1;
         card.setAttribute('aria-disabled', 'true');
         card.classList.add('disabled');
      }
    });

    selectors.modalCloseButton.addEventListener('click', closeModal);
    selectors.modalOverlay.addEventListener('click', (event) => {
      if (event.target === selectors.modalOverlay) {
        closeModal();
      }
    });
  }

  function populateModal(projectId) {
    const project = projectData[projectId];
    const els = selectors.modalElements;

    if (!project || !els.title || !els.description || !els.featuresList || !els.tagsContainer || !els.githubLink || !els.otherLink || !els.otherLinkText) {
      console.error(`Cannot populate modal: Project data for "${projectId}" not found or required modal elements missing.`);
      return false;
    }

    els.title.textContent = project.title || 'Project Details';
    els.description.textContent = project.description || 'No description available.';

    const placeholderSrc = "images/placeholder-project.png";
    const imgSrc = project.imgSrc || placeholderSrc;
    const isActualImage = imgSrc !== placeholderSrc;

    if (els.image) {
      els.image.style.display = 'block';
      els.image.src = imgSrc;
      els.image.alt = project.imgAlt || `Image for ${project.title}` || 'Project image';
      els.image.classList.toggle('is-placeholder', !isActualImage);
    } else {
         console.warn("Modal image element not found.");
    }

    if (els.featuresList) {
        els.featuresList.innerHTML = '';
        if (project.features && Array.isArray(project.features) && project.features.length > 0) {
            project.features.forEach(text => {
                const li = document.createElement('li');
                li.textContent = text;
                els.featuresList.appendChild(li);
            });
        } else {
             const li = document.createElement('li');
             li.textContent = "No key features listed for this project.";
             els.featuresList.appendChild(li);
        }
    } else {
         console.warn("Modal features list element not found.");
    }


     if (els.tagsContainer) {
        els.tagsContainer.innerHTML = '';
        if (project.tags && Array.isArray(project.tags) && project.tags.length > 0) {
            project.tags.forEach(text => {
                const span = document.createElement('span');
                span.textContent = text;
                els.tagsContainer.appendChild(span);
            });
        } else {
             const span = document.createElement('span');
             span.textContent = "No tech stack specified.";
             els.tagsContainer.appendChild(span);
        }
     } else {
          console.warn("Modal tags container element not found.");
     }

    if (els.githubLink) {
        els.githubLink.style.display = project.githubLink ? 'inline-flex' : 'none';
        if (project.githubLink) {
            els.githubLink.href = project.githubLink;
            els.githubLink.target = "_blank";
            els.githubLink.rel = "noopener noreferrer";
            els.githubLink.setAttribute('aria-label', `View ${project.title || 'project'} on GitHub`);
        } else {
            els.githubLink.href = '#';
            els.githubLink.removeAttribute('target');
            els.githubLink.removeAttribute('rel');
             els.githubLink.removeAttribute('aria-label');
        }
    } else {
        console.warn("Modal GitHub link element not found.");
    }


    if (els.otherLink && els.otherLinkText) {
        const hasOtherLink = project.otherLink && project.otherLinkText;
        els.otherLink.style.display = hasOtherLink ? 'inline-flex' : 'none';
        if (hasOtherLink) {
            els.otherLink.href = project.otherLink;
            els.otherLinkText.textContent = project.otherLinkText;
            els.otherLink.target = "_blank";
            els.otherLink.rel = "noopener noreferrer";
             els.otherLink.setAttribute('aria-label', `View ${project.title || 'project'} on ${project.otherLinkText}`);
        } else {
             els.otherLink.href = '#';
             els.otherLinkText.textContent = '';
             els.otherLink.removeAttribute('target');
            els.otherLink.removeAttribute('rel');
            els.otherLink.removeAttribute('aria-label');
        }
    } else {
        console.warn("Modal other link element not found.");
    }

    return true;
  }

  function openModal(projectId) {
    closeColorPalette();

    stopAllBackgroundAnimations();

    if (!populateModal(projectId)) {
      return;
    }

    if (!selectors.modalOverlay || !selectors.body) {
      console.error("Modal overlay or body element missing, cannot open modal.");
      return;
    }

    isModalVisible = true;

    selectors.modalOverlay.setAttribute('aria-hidden', 'false');
    selectors.sections.forEach(section => section.setAttribute('aria-hidden', 'true'));
    selectors.siteHeader?.setAttribute('aria-hidden', 'true');

    if (selectors.modalContent) {
      selectors.modalContent.scrollTop = 0;
    }

    requestAnimationFrame(() => {
      selectors.modalOverlay.classList.add('is-visible');
      setTimeout(() => {
          selectors.modalCloseButton?.focus();
      }, 50);
    });

    selectors.body.style.overflow = 'hidden';
    if (selectors.scrollContainer) {
         selectors.scrollContainer.style.overflowY = 'hidden';
    }
  }

  function closeModal() {
    if (!isModalVisible || !selectors.modalOverlay) {
      return;
    }

    isModalVisible = false;

    requestAnimationFrame(() => {
        selectors.modalOverlay.classList.remove('is-visible');
        selectors.modalOverlay.setAttribute('aria-hidden', 'true');
        selectors.sections.forEach(section => section.removeAttribute('aria-hidden'));
         selectors.siteHeader?.removeAttribute('aria-hidden');

         if (selectors.body) {
            selectors.body.style.overflow = '';
         }
         if (selectors.scrollContainer) {
            selectors.scrollContainer.style.overflowY = 'scroll';
         }
    });

    setTimeout(() => {
        updateScrollVisibility();
    }, 400);
  }

  function handleGlobalClick(event) {
    if (isPaletteVisible &&
        selectors.colorPaletteToggleButton &&
        !selectors.colorPaletteToggleButton.contains(event.target) &&
        selectors.colorPaletteDropdown &&
        !selectors.colorPaletteDropdown.contains(event.target)) {
      closeColorPalette();
    }
  }

  initializeApp();

});