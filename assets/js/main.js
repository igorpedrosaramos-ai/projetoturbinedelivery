/**
 * Turbine Gestão de Delivery - Main Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 3. Interactive FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherContent = other.querySelector('.faq-content');
            if (otherContent) otherContent.classList.add('hidden');
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          const content = item.querySelector('.faq-content');
          if (content) content.classList.add('hidden');
        } else {
          item.classList.add('active');
          const content = item.querySelector('.faq-content');
          if (content) content.classList.remove('hidden');
        }
      });
    }
  });

  // 4. Sticky Floating WhatsApp Pill
  const stickyWhatsapp = document.getElementById('stickyWhatsapp');

  if (stickyWhatsapp) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        stickyWhatsapp.classList.remove('translate-y-24', 'opacity-0');
        stickyWhatsapp.classList.add('translate-y-0', 'opacity-100');
      } else {
        stickyWhatsapp.classList.remove('translate-y-0', 'opacity-100');
        stickyWhatsapp.classList.add('translate-y-24', 'opacity-0');
      }
    });
  }

  // 5. Smooth Scroll Offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 90;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 6. Interactive Card Stack (Por Que Escolher a Turbine)
  const cardStackStage = document.getElementById('cardStackStage');
  const cardStackPrev = document.getElementById('cardStackPrev');
  const cardStackNext = document.getElementById('cardStackNext');
  const cardStackReset = document.getElementById('cardStackReset');
  const cardStackCounter = document.getElementById('cardStackCounter');

  if (cardStackStage) {
    const cards = Array.from(cardStackStage.querySelectorAll('.cardstack-card'));
    const totalCards = cards.length;
    let currentIndex = 0;
    let isAnimating = false;

    function updateCardStack() {
      cards.forEach((card, index) => {
        // Calculate cyclic relative position from top: 0 = front, 1 = second, etc.
        const pos = (index - currentIndex + totalCards) % totalCards;
        card.setAttribute('data-pos', pos < 4 ? pos : 'hidden');
        
        // Dynamic bottom hint
        const hintSpan = card.querySelector('.card-bottom-bar span:last-child');
        if (hintSpan) {
          hintSpan.textContent = `${index + 1} de ${totalCards}`;
        }
      });

      // Update counter pill
      if (cardStackCounter) {
        cardStackCounter.textContent = `${currentIndex + 1} de ${totalCards}`;
      }
    }

    function advanceCard() {
      if (isAnimating) return;
      isAnimating = true;

      const currentCard = cards[currentIndex];
      if (currentCard) {
        currentCard.classList.add('card-flick-right');
      }

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % totalCards;
        if (currentCard) {
          currentCard.classList.remove('card-flick-right');
        }
        updateCardStack();
        isAnimating = false;
      }, 260);
    }

    function prevCard() {
      if (isAnimating) return;
      isAnimating = true;

      currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      updateCardStack();
      
      const newFrontCard = cards[currentIndex];
      if (newFrontCard) {
        newFrontCard.classList.add('card-flick-left');
        requestAnimationFrame(() => {
          setTimeout(() => {
            newFrontCard.classList.remove('card-flick-left');
            isAnimating = false;
          }, 40);
        });
      } else {
        isAnimating = false;
      }
    }

    function resetStack() {
      if (isAnimating) return;
      currentIndex = 0;
      updateCardStack();
    }

    // Button interactions
    if (cardStackNext) cardStackNext.addEventListener('click', advanceCard);
    if (cardStackPrev) cardStackPrev.addEventListener('click', prevCard);
    if (cardStackReset) cardStackReset.addEventListener('click', resetStack);

    // Clicking directly on the stage/front card advances to next
    cardStackStage.addEventListener('click', (e) => {
      const clickedCard = e.target.closest('.cardstack-card');
      if (clickedCard && clickedCard.getAttribute('data-pos') === '0') {
        advanceCard();
      }
    });

    // Mobile Touch Swipe support
    let touchStartX = 0;
    let touchStartY = 0;

    cardStackStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    cardStackStage.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].screenX - touchStartX;
      const diffY = e.changedTouches[0].screenY - touchStartY;
      
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          advanceCard(); // Swiped left -> next
        } else {
          prevCard();    // Swiped right -> prev
        }
      }
    }, { passive: true });

    // Keyboard navigation (Left/Right arrow) when section is visible
    window.addEventListener('keydown', (e) => {
      const rect = cardStackStage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        advanceCard();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      }
    });

    // Initial setup
    updateCardStack();
  }

  // 7. Typewriter Text Animation for "Por Que Escolher a Turbine?"
  const twPart1 = document.getElementById('twPart1');
  const twPart2 = document.getElementById('twPart2');
  const twBreak = document.getElementById('twBreak');
  const typewriterTitle = document.getElementById('typewriterTitle');
  const whySection = document.getElementById('sobre');

  if (twPart1 && twPart2 && twBreak && typewriterTitle && whySection) {
    const textLine1 = "Por Que Escolher";
    const textLine2 = "a Turbine?";
    const totalChars = textLine1.length + textLine2.length;
    
    let currentIndex = 0;
    let isDeleting = false;
    let timerId = null;
    let isRunning = false;

    const speed = 90;        // typing speed in ms
    const deleteSpeed = 45;  // deleting speed in ms
    const delay = 3000;      // pause with full text in ms
    const initialDelay = 400;// brief delay before typing starts when arriving at section

    function render(index) {
      if (index <= textLine1.length) {
        twPart1.textContent = textLine1.slice(0, index);
        twBreak.style.display = "none";
        twPart2.textContent = "";
      } else {
        twPart1.textContent = textLine1;
        twBreak.style.display = "inline";
        twPart2.textContent = textLine2.slice(0, index - textLine1.length);
      }
    }

    function step() {
      if (!isRunning) return;

      if (!isDeleting) {
        if (currentIndex < totalChars) {
          currentIndex++;
          render(currentIndex);
          timerId = setTimeout(step, speed);
        } else {
          // Finished typing: pause then delete
          timerId = setTimeout(() => {
            if (!isRunning) return;
            isDeleting = true;
            step();
          }, delay);
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
          render(currentIndex);
          timerId = setTimeout(step, deleteSpeed);
        } else {
          // Finished deleting: pause then type
          isDeleting = false;
          timerId = setTimeout(step, 450);
        }
      }
    }

    function startTypewriter() {
      if (isRunning) return;
      isRunning = true;
      clearTimeout(timerId);
      // Starts clean and types from scratch when user enters section
      currentIndex = 0;
      isDeleting = false;
      render(0);
      timerId = setTimeout(step, initialDelay);
    }

    function stopTypewriter() {
      isRunning = false;
      clearTimeout(timerId);
      // When leaving, show full title so it doesn't look broken if partially viewed
      currentIndex = totalChars;
      render(totalChars);
    }

    // Only triggers when the section is in the viewport (quando estiver nessa aba/seção)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !document.hidden) {
          startTypewriter();
        } else {
          stopTypewriter();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(whySection);

    // Also handle browser tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopTypewriter();
      } else {
        const rect = whySection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) {
          startTypewriter();
        }
      }
    });
  }

  // 8. Horizontal Timeline with GSAP & ScrollTrigger for "5 Passos do Sucesso Turbine"
  function initStepsTimeline() {
    const pinnedViewport = document.querySelector('.steps-pinned-viewport');
    const track = document.getElementById('stepsSliderTrack');
    const lineFill = document.getElementById('stepsAxisLineFill');

    if (!pinnedViewport || !track || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Responsive setup: On screens >= 1024px, run the pinned horizontal scrub
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const getScrollDistance = () => {
        return Math.max(0, track.scrollWidth - window.innerWidth + 80);
      };

      // Main horizontal sliding animation
      const horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none"
      });

      // Pin and scrub on the sticky viewport
      ScrollTrigger.create({
        trigger: pinnedViewport,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 4, getScrollDistance())}`,
        pin: true,
        animation: horizontalTween,
        scrub: 1,
        invalidateOnRefresh: true,
      });

      // Center axis line drawing animation
      if (lineFill) {
        gsap.fromTo(lineFill, 
          { width: "0%" },
          {
            width: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: pinnedViewport,
              start: "top top",
              end: () => `+=${Math.max(window.innerHeight * 4, getScrollDistance())}`,
              scrub: 1,
              invalidateOnRefresh: true
            }
          }
        );
      }

      // Animate individual step milestones progressively as you scroll
      const milestones = track.querySelectorAll('.step-milestone');
      milestones.forEach((item) => {
        const stepNum = parseInt(item.getAttribute('data-step') || '1', 10);
        const isTop = item.classList.contains('step-milestone-top');
        const stem = item.querySelector('.step-stem');
        const dot = item.querySelector('.step-dot') || item.querySelector('.rounded-full');
        const content = item.querySelector('.step-content') || item.querySelector('div[class*="space-y-"]');

        if (stepNum === 1) {
          // Passo 1 starts directly in the middle of the screen!
          if (stem) gsap.set(stem, { scaleY: 1 });
          if (dot) gsap.set(dot, { scale: 1, opacity: 1, boxShadow: "0 0 20px rgba(244,197,66,0.95)" });
          if (content) gsap.set(content, { opacity: 1, y: 0 });

          // As Passo 1 scrolls out to the left, fade it out gracefully
          gsap.to(item, {
            opacity: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: item,
              containerAnimation: horizontalTween,
              start: "left 35%",
              end: "left 10%",
              scrub: 0.5
            }
          });
          return;
        }

        // Passos 2, 3, 4, 5, 6:
        // Start completely hidden and unrevealed
        if (stem) gsap.set(stem, { scaleY: 0 });
        if (dot) gsap.set(dot, { scale: 0, opacity: 0 });
        if (content) gsap.set(content, { opacity: 0, y: isTop ? 28 : -28 });

        // Timeline: animates into full view as it approaches center
        const itemTl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            containerAnimation: horizontalTween,
            start: "left 80%",  // begins revealing as it approaches center
            end: "left 50%",    // 100% visible and fully formed exactly at center
            scrub: 0.5
          }
        });

        // 1. Stem reveals vertically from axis
        if (stem) {
          itemTl.to(stem, {
            scaleY: 1,
            ease: "power1.out",
            duration: 0.4
          }, 0);
        }

        // 2. Node dot lights up and scales
        if (dot) {
          itemTl.to(dot, {
            scale: 1,
            opacity: 1,
            boxShadow: "0 0 20px rgba(244,197,66,0.95)",
            ease: "back.out(1.5)",
            duration: 0.35
          }, 0.1);
        }

        // 3. Text content fades in and glides into position
        if (content) {
          itemTl.to(content, {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            duration: 0.5
          }, 0.15);
        }

        // 4. Fade out gently when exiting to the left
        gsap.to(item, {
          opacity: 0,
          ease: "power1.out",
          scrollTrigger: {
            trigger: item,
            containerAnimation: horizontalTween,
            start: "left 32%",
            end: "left 8%",
            scrub: 0.5
          }
        });
      });

      // Cleanup when leaving desktop breakpoint (resize / zoom)
      return () => {
        gsap.set(track, { clearProps: "all" });
        if (lineFill) gsap.set(lineFill, { clearProps: "all" });
        milestones.forEach((item) => {
          gsap.set(item, { clearProps: "all" });
          const stem = item.querySelector('.step-stem');
          const dot = item.querySelector('.step-dot') || item.querySelector('.rounded-full');
          const content = item.querySelector('.step-content');
          if (stem) gsap.set(stem, { clearProps: "all" });
          if (dot) gsap.set(dot, { clearProps: "all" });
          if (content) gsap.set(content, { clearProps: "all" });
        });
      };
    });

    // Mobile & Tablet (< 1024px): reset any inline transforms and opacities
    mm.add("(max-width: 1023px)", () => {
      gsap.set(track, { clearProps: "all" });
      if (lineFill) gsap.set(lineFill, { clearProps: "all" });
      const milestones = track.querySelectorAll('.step-milestone');
      milestones.forEach((item) => {
        gsap.set(item, { clearProps: "all" });
        const stem = item.querySelector('.step-stem');
        const dot = item.querySelector('.step-dot') || item.querySelector('.rounded-full');
        const content = item.querySelector('.step-content');
        if (stem) gsap.set(stem, { clearProps: "all" });
        if (dot) gsap.set(dot, { clearProps: "all" });
        if (content) gsap.set(content, { clearProps: "all" });
      });
    });

    // Window resize / zoom listener with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh(true);
      }, 150);
    });
  }

  initStepsTimeline();

  // Client Stream Marquee Arrows Interactivity
  const clientsPrev = document.getElementById('clientsStreamPrev');
  const clientsNext = document.getElementById('clientsStreamNext');
  const clientsTrack = document.getElementById('clientsStreamTrack');
  if (clientsPrev && clientsNext && clientsTrack) {
    let currentShift = 0;
    clientsPrev.addEventListener('click', () => {
      currentShift += 280;
      clientsTrack.style.transform = `translateX(${currentShift}px)`;
    });
    clientsNext.addEventListener('click', () => {
      currentShift -= 280;
      clientsTrack.style.transform = `translateX(${currentShift}px)`;
    });
  }
});

