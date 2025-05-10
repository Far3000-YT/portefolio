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
  let isPaletteVisible = false;
  let lastScrollInitiationTime = 0;

  // --- NEW Scale Animation State ---
  let currentLightScale = 1.0;
  let targetLightScale = 1.0;
  let scaleAnimationStartTime = null;
  const SCALE_ANIMATION_DURATION = 400; // ms (e.g., 0.4 seconds)
  // --- END NEW Scale Animation State ---

  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;
  const TOUCH_SWIPE_THRESHOLD_Y = 50;
  const TOUCH_TIME_THRESHOLD = 300;

  const sectionAnimationState = {
    1: { currencyTimeoutId: null },
    3: { currencyTimeoutId: null }
  };

  const SCROLL_ANIMATION_DURATION = 700;
  const CURRENCY_SPAWN_INTERVAL = [700, 1000];
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
    "lumen": {
      title: "Lumen - Project To AI Prompt Utility",
      imgSrc: "images/project-lum.png",
      imgAlt: "Lumen CLI + browser (Google AI Studio) demo",
      description: "A Python CLI utility (>1000 PyPI downloads) designed to bridge the gap between complex codebases and AI language models. Lumen automates the tedious process of gathering project structure and relevant code files, generating a single, comprehensive, and well-formatted prompt optimized for AI analysis, debugging, or documentation tasks.",
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
      githubLink: "https://github.com/Far3000-YT/lumen",
      otherLink: "https://pypi.org/project/pylumen/",
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

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function initializeApp() {
    setupThemeSwitcher();
    setupColorChooser();
    setupScrollManager();
    setupCursorAndLight();
    setupBackgroundAnimations();
    setupModal();

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (isMobile()) {
      selectors.body.classList.add('is-mobile');
      selectors.siteHeader?.style.removeProperty('animation');
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
          setupCursorAndLight(); // Re-setup cursor/light on resize crossing breakpoint
          if (isCurrentlyMobile) {
            selectors.siteHeader?.style.setProperty('animation', 'none', 'important');
          } else {
            selectors.siteHeader?.style.removeProperty('animation');
          }
        }
        // No need to call updateScrollVisibility here if only cursor changes
        // If layout might drastically change affecting scroll positions, add it back
        // updateScrollVisibility();
      }, 200);
    });
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopAllBackgroundAnimations();
      // Also stop cursor RAF loop if page is hidden
      if (rafIdCursor) {
        cancelAnimationFrame(rafIdCursor);
        rafIdCursor = null;
      }
    } else {
      // Restart cursor RAF loop if needed and not mobile
      if (!isMobile() && rafIdCursor === null && selectors.cursorDot?.classList.contains('visible')) {
         rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
      }
      // Restart background anims if needed
      if (!isModalVisible && currentScrollIndex >= 0 && currentScrollIndex < selectors.sections.length) {
         handleSectionBackgroundAnimations(currentScrollIndex, 'start');
      }
    }
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

    // Clean up previous listeners first
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

    // Reset scale state if setup is called (e.g., on resize)
    currentLightScale = 1.0;
    targetLightScale = 1.0;
    scaleAnimationStartTime = null;


    if (customCursorActive) {
      selectors.cursorDot.style.display = '';
      selectors.backgroundLight.style.display = '';
      selectors.backgroundLight.classList.remove('is-mobile-animated');
      // Reset light transform to base state before JS takes over
      selectors.backgroundLight.style.transform = `translate(-50%, -50%) scale(${currentLightScale})`;

      document.addEventListener('mousemove', handleMouseMoveForEffects, { passive: true });
      document.documentElement.addEventListener('mouseleave', handleMouseLeaveEffects);
      document.documentElement.addEventListener('mouseenter', handleMouseEnterEffects);
      selectors.interactiveElements?.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnterInteractive);
        el.addEventListener('mouseleave', handleMouseLeaveInteractive);
      });

    } else if (mobileLightActive) {
      selectors.cursorDot?.style.setProperty('display', 'none', 'important');
      selectors.backgroundLight.style.display = '';
      selectors.backgroundLight.classList.add('is-mobile-animated');

      // Ensure mobile doesn't inherit JS transform
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

      // --- START Scale Animation ---
      if (targetLightScale !== 0.6) {
        targetLightScale = 0.6;
        scaleAnimationStartTime = performance.now(); // Use high-res timer
        // Ensure RAF loop is running
        if (!rafIdCursor) {
            rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
        }
      }
      // --- END Scale Animation ---

       // Still apply class for filter/background changes
       selectors.backgroundLight?.classList.add('is-intensified');
    }
  }

  function handleMouseLeaveInteractive() {
    if (!isMobile()) {
      selectors.cursorDot?.classList.remove('hover');

      // --- START Scale Animation ---
       if (targetLightScale !== 1.0) {
        targetLightScale = 1.0;
        scaleAnimationStartTime = performance.now();
        // Ensure RAF loop is running
        if (!rafIdCursor) {
            rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
        }
      }
      // --- END Scale Animation ---

      // Still remove class for filter/background changes
      selectors.backgroundLight?.classList.remove('is-intensified');
    }
  }


  function handleMouseMoveForEffects(event) {
    if (isMobile()) return;

    mouseX = event.clientX;
    mouseY = event.clientY;

    // Make elements visible on first move
    if (selectors.cursorDot && !selectors.cursorDot.classList.contains('visible')) {
      selectors.cursorDot.classList.add('visible');
    }
    if (selectors.backgroundLight && !selectors.backgroundLight.classList.contains('visible')) {
      selectors.backgroundLight.classList.add('visible');
    }

    // Start RAF loop if not already running
    if (rafIdCursor === null) {
        rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
    }
  }

  function updateCursorAndLightPosition() {
    if (!selectors.backgroundLight || isMobile()) {
        // Clean up if we switched to mobile or element disappeared
        if(rafIdCursor) cancelAnimationFrame(rafIdCursor);
        rafIdCursor = null;
        return;
    }

    const now = performance.now();

    // --- Scale Animation Logic ---
    let startScale = 1.0; // Default
    if (scaleAnimationStartTime !== null) {
        const elapsedTime = now - scaleAnimationStartTime;
        const progress = Math.min(elapsedTime / SCALE_ANIMATION_DURATION, 1);
        const easedProgress = easeInOutCubic(progress); // Use your existing easing function

        // Determine the scale value we are animating *from*
        startScale = (targetLightScale === 0.6) ? 1.0 : 0.6;

        currentLightScale = startScale + (targetLightScale - startScale) * easedProgress;

        if (progress >= 1) {
            currentLightScale = targetLightScale; // Ensure exact target value
            scaleAnimationStartTime = null; // Animation finished
        }
    } else {
        // If no animation running, ensure scale is at the target
        // This handles the initial state correctly
        currentLightScale = targetLightScale;
    }
    // --- END Scale Animation Logic ---


    if (selectors.cursorDot) {
        // Update cursor dot position (always instant)
        selectors.cursorDot.style.left = mouseX + 'px';
        selectors.cursorDot.style.top = mouseY + 'px';
    }

    // --- Update Background Light Transform with BOTH translate and scale ---
    // Note: Re-adding translate(-50%, -50%) here as it was removed from CSS base style
    selectors.backgroundLight.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(${currentLightScale})`;
    // --- END Update Transform ---


    // Keep the loop going - request the *next* frame
    rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
  }


  function handleMouseLeaveEffects() {
    if (!selectors.cursorDot || !selectors.backgroundLight || isMobile()) return;
    selectors.cursorDot.classList.remove('visible', 'hover');
    selectors.backgroundLight.classList.remove('visible', 'is-intensified');

    // Stop the RAF loop when mouse leaves the window
    if (rafIdCursor) {
      cancelAnimationFrame(rafIdCursor);
      rafIdCursor = null;
    }

     // Reset scale when leaving window
     targetLightScale = 1.0;
     currentLightScale = 1.0;
     scaleAnimationStartTime = null;
     selectors.backgroundLight.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(${currentLightScale})`;

  }

  function handleMouseEnterEffects() {
    if (!selectors.cursorDot || !selectors.backgroundLight || isMobile()) return;

    // Make visible immediately on entering window
    if (!selectors.cursorDot.classList.contains('visible')) {
      selectors.cursorDot.classList.add('visible');
    }
    if (!selectors.backgroundLight.classList.contains('visible')) {
      selectors.backgroundLight.classList.add('visible');
    }

    // Start RAF loop ONLY if it's not already running
    if (rafIdCursor === null) {
      rafIdCursor = requestAnimationFrame(updateCursorAndLightPosition);
    }
  }


  // ===========================================================================
  // Scroll Management, Modal, Background Animations (Largely Unchanged)
  // ===========================================================================

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
        updateScrollVisibility(); // Ensure final visibility update
      }
    };

    scrollAnimationId = requestAnimationFrame(step);
  }

  function scrollToSection(index) {
    index = clamp(index, 0, selectors.sections.length - 1);

    if (index === currentScrollIndex && !isScrollAnimating) {
      // Even if index is same, ensure correct visibility if called directly
      updateScrollVisibility();
      return;
    }

    const targetSection = selectors.sections[index];
    if (!targetSection) {
      console.error(`Section at index ${index} not found.`);
      return;
    }

    handleSectionBackgroundAnimations(currentScrollIndex, 'stop'); // Stop anims on old section

    currentScrollIndex = index; // Update index immediately for visibility check
    updateScrollVisibility(); // Update visibility classes BEFORE animation starts

    const targetScrollTop = targetSection.offsetTop;
    animateScroll(targetScrollTop);
  }

  function updateScrollVisibility() {
    const containerHeight = selectors.scrollContainer.clientHeight;
    const scrollTop = selectors.scrollContainer.scrollTop;
    let determinedIndex = currentScrollIndex; // Start with current index
    let minDistance = Infinity;

    // Find the section closest to the top of the viewport during scroll
    selectors.sections.forEach((section, idx) => {
      const sectionTop = section.offsetTop;
      const distance = Math.abs(scrollTop - sectionTop); // Distance from section top to viewport top
      const sectionBottom = sectionTop + section.offsetHeight;
      const containerBottom = scrollTop + containerHeight;

      // Check if section is at least partially visible
      const isPartiallyVisible = (sectionTop < containerBottom && sectionBottom > scrollTop);

      if (isPartiallyVisible) {
          // Prioritize the section whose top is closest to the viewport top
          if (distance < minDistance) {
              minDistance = distance;
              determinedIndex = idx;
          }
      }
    });

    // Ensure index is valid
    determinedIndex = clamp(determinedIndex, 0, selectors.sections.length - 1);

    // Update visibility classes and background animations
    selectors.sections.forEach((section, idx) => {
      const isCurrent = idx === determinedIndex;
      const wasVisible = section.classList.contains('is-visible');

      section.classList.toggle('is-visible', isCurrent);

      // Manage background animations based on visibility change
      if (isCurrent && !wasVisible) {
        handleSectionBackgroundAnimations(idx, 'start');
      } else if (!isCurrent && wasVisible) {
        handleSectionBackgroundAnimations(idx, 'stop');
      }
    });

    // Update the active navigation link
    updateActiveNavLink(determinedIndex);

    // Update the currentScrollIndex if it has changed and we're not animating
    if (!isScrollAnimating && currentScrollIndex !== determinedIndex) {
        currentScrollIndex = determinedIndex;
    }

    // Check if the user has scrolled past the first section
    checkFirstScroll();
  }

  function updateActiveNavLink(activeSectionIndex) {
    const currentSectionId = selectors.sections[activeSectionIndex]?.id;
    if (!currentSectionId) return;

    selectors.navLinks?.forEach(link => {
      const linkHref = link.getAttribute('href');
      // Handle both "#" and "#hero" pointing to the first section
      const linkTargetId = (linkHref === '#' || (linkHref === '#hero' && activeSectionIndex === 0)) ? 'hero' : linkHref?.replace('#', '');
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
    // Prevent scroll if modal or palette is open and interaction is within them
    if (isModalVisible || isPaletteVisible) {
      const scrollableContent = isModalVisible ? selectors.modalContent : selectors.colorPaletteDropdown;
      if (scrollableContent?.contains(event.target)) {
        const isScrollable = scrollableContent.scrollHeight > scrollableContent.clientHeight;
        const atTop = event.deltaY < 0 && scrollableContent.scrollTop <= 1;
        const atBottom = event.deltaY > 0 && scrollableContent.scrollTop >= (scrollableContent.scrollHeight - scrollableContent.clientHeight - 1);

        // Allow scroll within the modal/palette unless at the very top/bottom
        if (isScrollable && (!atTop || event.deltaY > 0) && (!atBottom || event.deltaY < 0)) {
          return; // Don't prevent default, allow internal scroll
        }
      }
      // If outside or at boundary, prevent page scroll
      event.preventDefault();
      return;
    } else {
      // Always prevent default page scroll when managing sections
      event.preventDefault();
    }


    const now = Date.now();
    // Debounce scroll initiation
    if (isScrollAnimating || now - lastScrollInitiationTime < 800) { // Increased debounce time slightly
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
      lastScrollInitiationTime = now;
      scrollToSection(targetIndex);
    }
  }

  function handleTouchStart(event) {
    if (isModalVisible || isPaletteVisible || event.touches.length !== 1) {
      return;
    }
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
    touchStartTime = Date.now();
  }

  function handleTouchMove(event) {
    if (isModalVisible || isPaletteVisible || isScrollAnimating || event.touches.length !== 1) {
      return;
    }
    const deltaY = event.touches[0].clientY - touchStartY;
    const deltaX = event.touches[0].clientX - touchStartX;

    // Prevent default page scroll only if swipe is primarily vertical
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      event.preventDefault();
    }
  }

  function handleTouchEnd(event) {
    if (isModalVisible || isPaletteVisible || isScrollAnimating || event.changedTouches.length !== 1) {
        touchStartY = 0; touchStartX = 0; touchStartTime = 0; // Reset state
        return;
    }
    const endY = event.changedTouches[0].clientY;
    const endX = event.changedTouches[0].clientX; // Get end X as well
    const endTime = Date.now();
    const swipeDistanceY = endY - touchStartY;
    const swipeDistanceX = endX - touchStartX; // Calculate X distance
    const swipeTime = endTime - touchStartTime;

    const now = Date.now();
    // Debounce scroll initiation
    if (now - lastScrollInitiationTime < 800) {
        touchStartY = 0; touchStartX = 0; touchStartTime = 0;
        return;
    }

    let targetIndex = currentScrollIndex;
    let shouldScroll = false;

    // Check if the swipe was primarily vertical
    if (Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX) * 1.5) { // More vertical than horizontal
        const isFastSwipe = Math.abs(swipeDistanceY) > 10 && swipeTime < TOUCH_TIME_THRESHOLD;
        const isLongSwipe = Math.abs(swipeDistanceY) > TOUCH_SWIPE_THRESHOLD_Y;

        if (isFastSwipe || isLongSwipe) {
          if (swipeDistanceY < 0) { // Swipe Up
            if (currentScrollIndex < selectors.sections.length - 1) {
              targetIndex++;
              shouldScroll = true;
            }
          } else if (swipeDistanceY > 0) { // Swipe Down
            if (currentScrollIndex > 0) {
              targetIndex--;
              shouldScroll = true;
            }
          }
        }
    }

    if (shouldScroll && targetIndex !== currentScrollIndex) {
      lastScrollInitiationTime = now;
      scrollToSection(targetIndex);
    }

    // Reset touch state
    touchStartY = 0;
    touchStartX = 0;
    touchStartTime = 0;
  }

  function handleKeydownScroll(event) {
    // Handle Esc for modal and palette first
     if (event.key === 'Escape') {
        if (isModalVisible) {
            closeModal();
            event.preventDefault();
            return;
        }
        if (isPaletteVisible) {
            closeColorPalette();
            event.preventDefault();
            return;
        }
     }

    // Prevent specific keys from scrolling the page when modal/palette is open
    if (isModalVisible) {
      if (['ArrowUp', 'ArrowDown', ' ', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
          // Allow scrolling within the modal content itself if focused within it
          if (!selectors.modalContent?.contains(document.activeElement)) {
             event.preventDefault();
          }
      }
      return; // Don't process section scrolling keys if modal is open
    }
    if (isPaletteVisible) {
       if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
         event.preventDefault();
       }
       return; // Don't process section scrolling keys if palette is open
    }

    // Ignore if animating, modifier keys pressed, or inside an input
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
        }
        preventDefault = true; // Prevent default page scroll regardless
        break;
      case ' ': // Space bar
        if (currentScrollIndex < selectors.sections.length - 1) {
          targetIndex++;
          shouldScroll = true;
        }
        preventDefault = true; // Prevent default page scroll for space
        break;
      case 'ArrowUp':
      case 'PageUp':
        if (currentScrollIndex > 0) {
          targetIndex--;
          shouldScroll = true;
        }
        preventDefault = true; // Prevent default page scroll regardless
        break;
      case 'Home':
        if (currentScrollIndex !== 0) {
          targetIndex = 0;
          shouldScroll = true;
        }
        preventDefault = true; // Prevent default page scroll
        break;
      case 'End':
        if (currentScrollIndex !== selectors.sections.length - 1) {
          targetIndex = selectors.sections.length - 1;
          shouldScroll = true;
        }
        preventDefault = true; // Prevent default page scroll
        break;
      default:
        return; // Do nothing for other keys
    }

    if (preventDefault) {
      event.preventDefault();
    }

    // Debounce keydown scrolling slightly
    const now = Date.now();
    if (shouldScroll && now - lastScrollInitiationTime > 500) { // Shorter debounce for keys
        lastScrollInitiationTime = now;
        scrollToSection(targetIndex);
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
        scrollToSection(0); // Scroll to top if href is just "#"
        return;
      }

      const targetElementId = targetId.replace('#', '');
      const targetElement = document.getElementById(targetElementId);

      if (!targetElement) {
        console.error(`Target element "${targetId}" not found.`);
        // Fallback: maybe scroll to top? or do nothing?
        scrollToSection(0);
        return;
      }

      const targetIndex = selectors.sections.findIndex(sec => sec.id === targetElement.id);

      if (targetIndex !== -1) {
        // It's one of our main sections, use the custom scroll
        scrollToSection(clamp(targetIndex, 0, selectors.sections.length - 1));
      } else {
        // It's some other element on the page (shouldn't happen with current structure)
        // Fallback to default browser scroll (though likely won't work well)
        console.warn(`Target "${targetId}" is not a main scroll section.`);
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Error handling navigation link:", error);
      scrollToSection(0); // Fallback to top on error
    }
  }

  function setupBackgroundAnimations() {
    // Initial setup - ensure all animations are stopped
    stopAllBackgroundAnimations();
  }

  function handleSectionBackgroundAnimations(sectionIndex, action) {
    // Do not run animations if modal is visible or page is hidden
    if (isModalVisible || document.hidden) {
      stopAllBackgroundAnimations(); // Ensure they are stopped
      return;
    }

    const state = sectionAnimationState[sectionIndex];
    if (!state) return; // Only sections 1 and 3 have animations defined

    const sectionElement = selectors.sections[sectionIndex];
    if (!sectionElement) return;

    if (action === 'start') {
        // Start only if section is currently visible and animation is not already running
      if (sectionElement.classList.contains('is-visible') && state.currencyTimeoutId === null) {
        startSectionCurrencySpawn(sectionIndex);
      }
    } else if (action === 'stop') {
        // Stop only if animation is running
      if (state.currencyTimeoutId !== null) {
        stopSectionCurrencySpawn(sectionIndex);
      }
    }
  }

  function startSectionCurrencySpawn(sectionIndex) {
    if (document.hidden || isModalVisible) return; // Double check

    const sectionElement = selectors.sections[sectionIndex];
    if (!sectionElement) return;
    const state = sectionAnimationState[sectionIndex];
    if (!state || state.currencyTimeoutId !== null) return; // Already running or no state

    const animatedShapesContainer = sectionElement.querySelector('.animated-shapes');
    if (!animatedShapesContainer) {
      console.warn(`No .animated-shapes container found in section ${sectionIndex}`);
      return;
    }

    const scheduleNextSpawn = () => {
      // Continue spawning only if the section is *still* the visible one,
      // page is not hidden, and modal is not open
      if (!document.hidden && !isModalVisible && sectionElement.classList.contains('is-visible')) {
        const delay = getRandomInt(CURRENCY_SPAWN_INTERVAL[0], CURRENCY_SPAWN_INTERVAL[1]);
        // Store timeout ID in the state object for this section
        state.currencyTimeoutId = setTimeout(() => {
          spawnCurrencySymbol(animatedShapesContainer); // Spawn one symbol
          scheduleNextSpawn(); // Schedule the next one
        }, delay);
      } else {
        // If conditions change, stop the spawning loop for this section
        stopSectionCurrencySpawn(sectionIndex);
      }
    };

    // Start the first spawn after a short random delay
    const firstDelay = getRandomInt(100, CURRENCY_SPAWN_INTERVAL[0]);
    state.currencyTimeoutId = setTimeout(() => {
       if (!document.hidden && !isModalVisible && sectionElement.classList.contains('is-visible')) {
            spawnCurrencySymbol(animatedShapesContainer);
            scheduleNextSpawn();
       } else {
           state.currencyTimeoutId = null; // Condition changed before first spawn
       }
    }, firstDelay);
  }

  function stopSectionCurrencySpawn(sectionIndex) {
    const state = sectionAnimationState[sectionIndex];
    if (!state || state.currencyTimeoutId === null) return; // Not running or no state

    clearTimeout(state.currencyTimeoutId);
    state.currencyTimeoutId = null; // Mark as stopped

    // Optional: Immediately remove existing symbols when stopped
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
      stopSectionCurrencySpawn(parseInt(indexStr, 10));
    });
    // Also ensure any stray symbols are removed from all sections
    selectors.sections.forEach(section => {
      const animatedShapesContainer = section.querySelector('.animated-shapes');
      if(animatedShapesContainer) {
        animatedShapesContainer.querySelectorAll('.currency-symbol').forEach(symbol => symbol.remove());
      }
    });
  }

  const CURRENCY_SYMBOLS = ['$', '€', '€', '₮', '₿', '₿', '₿', '₿', '⟠', '⟠', '⟠', '$', '$', '$', 'Ψ', 'ϑ'];

  function spawnCurrencySymbol(containerElement) {
    // Final check before creating element
    if (document.hidden || isModalVisible || !containerElement || !containerElement.closest('.scroll-section.is-visible')) return;

    const symbolEl = document.createElement('span');
    symbolEl.classList.add('currency-symbol');
    symbolEl.setAttribute('aria-hidden', 'true'); // Decorative element
    symbolEl.textContent = CURRENCY_SYMBOLS[getRandomInt(0, CURRENCY_SYMBOLS.length - 1)];

    const startX = getRandomNumber(10, 90);
    const startY = getRandomNumber(10, 90);
    symbolEl.style.position = 'absolute';
    symbolEl.style.left = `${startX}%`;
    symbolEl.style.top = `${startY}%`;
    // Ensure it's not interactive
    symbolEl.style.pointerEvents = 'none';

    const animDuration = getRandomInt(CURRENCY_ANIMATION_DURATION[0], CURRENCY_ANIMATION_DURATION[1]);
    const floatX = (startX > 50 ? -1 : 1) * getRandomNumber(20, 60);
    const floatY = (startY > 50 ? -1 : 1) * getRandomNumber(40, 80);
    const floatRotate = getRandomNumber(-30, 30);

    symbolEl.style.setProperty('--float-x', `${floatX}px`);
    symbolEl.style.setProperty('--float-y', `${floatY}px`);
    symbolEl.style.setProperty('--float-rotate', `${floatRotate}deg`);

    containerElement.appendChild(symbolEl);

    // Trigger animation slightly deferred to ensure styles are applied
    requestAnimationFrame(() => {
      // Use a minimal timeout to allow rendering before animation starts
      setTimeout(() => {
         // Check again if still valid before starting animation
         if (containerElement.closest('.scroll-section.is-visible')) {
            symbolEl.style.animation = `floatFade ${animDuration}ms ease-out forwards`;
         } else {
             symbolEl.remove(); // Remove immediately if section became invisible
         }
      }, 10);
    });

    // Clean up the element after animation ends
    symbolEl.addEventListener('animationend', () => {
      symbolEl.remove();
    }, { once: true });
  }

  function setupModal() {
    if (!selectors.modalOverlay || !selectors.modalContent || !selectors.modalCloseButton || selectors.projectCards.length === 0) {
      selectors.modalOverlay?.remove(); // Remove from DOM if unusable
      console.warn("Modal elements or project cards not found, modal functionality disabled.");
      return;
    }

    // Cache modal child elements
    selectors.modalElements.image = selectors.modalOverlay.querySelector('.modal-project-image');
    selectors.modalElements.title = selectors.modalOverlay.querySelector('#modal-project-title');
    selectors.modalElements.description = selectors.modalOverlay.querySelector('.modal-project-description');
    selectors.modalElements.featuresList = selectors.modalOverlay.querySelector('.modal-project-features');
    selectors.modalElements.tagsContainer = selectors.modalOverlay.querySelector('.modal-project-tags');
    selectors.modalElements.githubLink = selectors.modalOverlay.querySelector('.modal-project-link-button.github');
    selectors.modalElements.otherLink = selectors.modalOverlay.querySelector('.modal-project-link-button.other');
    selectors.modalElements.otherLinkText = selectors.modalOverlay.querySelector('.other-link-text');

    // Basic check if elements were found
    if (!selectors.modalElements.title || !selectors.modalElements.description || !selectors.modalElements.image || !selectors.modalElements.featuresList || !selectors.modalElements.tagsContainer || !selectors.modalElements.githubLink || !selectors.modalElements.otherLink || !selectors.modalElements.otherLinkText) {
      console.error("Some required modal child elements not found. Modal functionality may be limited or broken.");
      // Optionally disable modal here if critical elements are missing
    }

    // Add event listeners to project cards
    selectors.projectCards.forEach(card => {
      const projectId = card.dataset.projectId;
      if (projectId && projectData[projectId]) {
        // Click listener
        card.addEventListener('click', () => openModal(projectId));
        // Keyboard accessibility
        card.tabIndex = 0; // Make focusable
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent space bar scrolling
            openModal(projectId);
          }
        });
        // Semantics
        card.setAttribute('role', 'button');
        card.setAttribute('aria-haspopup', 'dialog');
      } else {
         // Disable cards without valid project data
         card.style.cursor = 'default';
         card.tabIndex = -1; // Remove from tab order
         card.setAttribute('aria-disabled', 'true');
         card.classList.add('disabled');
         // Remove listeners if they were somehow added before
         card.replaceWith(card.cloneNode(true)); // Simple way to remove all listeners
      }
    });

    // Add listeners for closing the modal
    selectors.modalCloseButton.addEventListener('click', closeModal);
    selectors.modalOverlay.addEventListener('click', (event) => {
      // Close only if clicking directly on the overlay, not the content inside
      if (event.target === selectors.modalOverlay) {
        closeModal();
      }
    });
  }

  function populateModal(projectId) {
    const project = projectData[projectId];
    const els = selectors.modalElements;

    // Check if project data and essential elements exist
    if (!project || !els.title || !els.description || !els.featuresList || !els.tagsContainer || !els.githubLink || !els.otherLink || !els.otherLinkText) {
      console.error(`Cannot populate modal: Project data for "${projectId}" not found or required modal elements missing.`);
      // Optionally display an error message in the modal here
      els.title.textContent = "Error";
      els.description.textContent = "Could not load project details.";
      // Hide other sections
      els.image.style.display = 'none';
      els.featuresList.innerHTML = '';
      els.tagsContainer.innerHTML = '';
      els.githubLink.style.display = 'none';
      els.otherLink.style.display = 'none';
      return false; // Indicate failure
    }

    // Populate title and description
    els.title.textContent = project.title || 'Project Details';
    els.description.textContent = project.description || 'No description available.';

    // Populate image
    const placeholderSrc = "images/placeholder-project.png"; // Define placeholder path
    const imgSrc = project.imgSrc || placeholderSrc;
    const isActualImage = imgSrc !== placeholderSrc && project.imgSrc; // Check if it's not the placeholder

    if (els.image) {
        els.image.style.display = 'block'; // Ensure visible
        els.image.src = imgSrc; // Set src
        // Provide meaningful alt text
        els.image.alt = project.imgAlt || (isActualImage ? `Screenshot for ${project.title}` : 'Project placeholder image');
        // Add class if using placeholder for potential specific styling
        els.image.classList.toggle('is-placeholder', !isActualImage);
    } else {
         console.warn("Modal image element not found during population.");
    }

    // Populate features list
    if (els.featuresList) {
      els.featuresList.innerHTML = ''; // Clear previous features
      if (project.features && Array.isArray(project.features) && project.features.length > 0) {
        project.features.forEach(text => {
          const li = document.createElement('li');
          li.textContent = text; // Use textContent for security
          els.featuresList.appendChild(li);
        });
      } else {
        // Provide feedback if no features are listed
        const li = document.createElement('li');
        li.textContent = "No key features listed for this project.";
        li.style.fontStyle = 'italic'; // Optional styling for feedback
        els.featuresList.appendChild(li);
      }
    } else {
      console.warn("Modal features list element not found during population.");
    }

    // Populate tags
    if (els.tagsContainer) {
      els.tagsContainer.innerHTML = ''; // Clear previous tags
      if (project.tags && Array.isArray(project.tags) && project.tags.length > 0) {
        project.tags.forEach(text => {
          const span = document.createElement('span');
          span.textContent = text; // Use textContent
          els.tagsContainer.appendChild(span);
        });
      } else {
        // Provide feedback if no tags are listed
        const span = document.createElement('span');
        span.textContent = "No tech stack specified.";
        span.style.fontStyle = 'italic'; // Optional styling
        els.tagsContainer.appendChild(span);
      }
    } else {
      console.warn("Modal tags container element not found during population.");
    }

    // Populate GitHub link
    if (els.githubLink) {
      if (project.githubLink) {
        els.githubLink.style.display = 'inline-flex'; // Make visible
        els.githubLink.href = project.githubLink;
        els.githubLink.target = "_blank"; // Open in new tab
        els.githubLink.rel = "noopener noreferrer"; // Security measure
        // Dynamic Aria Label
        els.githubLink.setAttribute('aria-label', `View ${project.title || 'project'} on GitHub`);
      } else {
        els.githubLink.style.display = 'none'; // Hide if no link
        els.githubLink.href = '#'; // Reset href
        els.githubLink.removeAttribute('target');
        els.githubLink.removeAttribute('rel');
        els.githubLink.removeAttribute('aria-label');
      }
    } else {
      console.warn("Modal GitHub link element not found during population.");
    }

    // Populate other link
    if (els.otherLink && els.otherLinkText) {
      const hasOtherLink = project.otherLink && project.otherLinkText;
      if (hasOtherLink) {
        els.otherLink.style.display = 'inline-flex'; // Make visible
        els.otherLink.href = project.otherLink;
        els.otherLinkText.textContent = project.otherLinkText;
        els.otherLink.target = "_blank";
        els.otherLink.rel = "noopener noreferrer";
        // Dynamic Aria Label
        els.otherLink.setAttribute('aria-label', `View ${project.title || 'project'} on ${project.otherLinkText}`);
      } else {
        els.otherLink.style.display = 'none'; // Hide if no link
        els.otherLink.href = '#'; // Reset href
        els.otherLinkText.textContent = ''; // Clear text
        els.otherLink.removeAttribute('target');
        els.otherLink.removeAttribute('rel');
        els.otherLink.removeAttribute('aria-label');
      }
    } else {
      console.warn("Modal other link element or text span not found during population.");
    }

    return true; // Indicate success
  }

  function openModal(projectId) {
    closeColorPalette(); // Close palette if open
    stopAllBackgroundAnimations(); // Stop currency symbols etc.

    // Attempt to populate the modal first
    if (!populateModal(projectId)) {
      console.error("Failed to populate modal, aborting open.")
      // Optionally show a generic error modal here
      return;
    }

    if (!selectors.modalOverlay || !selectors.body) {
      console.error("Modal overlay or body element missing, cannot open modal.");
      return;
    }

    isModalVisible = true; // Set flag

    // ARIA Handling: Hide background content from screen readers
    selectors.modalOverlay.setAttribute('aria-hidden', 'false');
    selectors.sections.forEach(section => section.setAttribute('aria-hidden', 'true'));
    selectors.siteHeader?.setAttribute('aria-hidden', 'true');

    // Ensure modal content is scrolled to top
    if (selectors.modalContent) {
      selectors.modalContent.scrollTop = 0;
    }

    // Prevent body scrolling
    selectors.body.style.overflow = 'hidden';
    if (selectors.scrollContainer) {
       selectors.scrollContainer.style.overflowY = 'hidden'; // Hide scrollbar on container too
    }


    // Animate modal entrance
    // Use rAF for smoother transition start
    requestAnimationFrame(() => {
      selectors.modalOverlay.classList.add('is-visible');
      // Set focus to the close button after transition for accessibility
      setTimeout(() => {
        selectors.modalCloseButton?.focus();
      }, 50); // Delay slightly longer than transition? Check CSS. Use transitionend listener for perfect timing.
    });

  }

  function closeModal() {
    if (!isModalVisible || !selectors.modalOverlay) {
      return; // Do nothing if modal isn't visible
    }

    isModalVisible = false; // Set flag

    // Animate modal exit
    requestAnimationFrame(() => {
        selectors.modalOverlay.classList.remove('is-visible');

        // ARIA Handling: Make background content accessible again
        selectors.modalOverlay.setAttribute('aria-hidden', 'true');
        selectors.sections.forEach(section => section.removeAttribute('aria-hidden'));
        selectors.siteHeader?.removeAttribute('aria-hidden');

        // Restore body scrolling *after* the transition ends
        // Use a timeout matching the CSS transition duration
        setTimeout(() => {
            if (!isModalVisible) { // Check if modal wasn't reopened quickly
                if (selectors.body) {
                    selectors.body.style.overflow = '';
                }
                if (selectors.scrollContainer) {
                    selectors.scrollContainer.style.overflowY = 'scroll';
                }
                // Restart background animations for the current section
                 updateScrollVisibility(); // This will call handleSectionBackgroundAnimations
            }
        }, 400); // Match CSS transition duration for opacity/transform
    });

    // Optional: Return focus to the button/card that opened the modal
    // This requires storing the trigger element in openModal()
    // e.g., previouslyFocusedElement?.focus();
  }

  function handleGlobalClick(event) {
    // Close color palette if clicking outside
    if (isPaletteVisible &&
        selectors.colorPaletteToggleButton &&
        !selectors.colorPaletteToggleButton.contains(event.target) &&
        selectors.colorPaletteDropdown &&
        !selectors.colorPaletteDropdown.contains(event.target)) {
      closeColorPalette();
    }
  }

  // Initialize the application
  initializeApp();

});