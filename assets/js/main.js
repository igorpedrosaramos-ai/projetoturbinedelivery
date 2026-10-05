/**
 * Turbine Gestão de Delivery - Main Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1.1 Sticky Header on Scroll
  const headerMain = document.querySelector('.header-main');
  if (headerMain) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 40) {
        headerMain.classList.add('header-scrolled');
      } else {
        headerMain.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
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

  // 4. Sticky Floating WhatsApp Button with smart hiding on CTA sections
  const stickyWhatsapp = document.getElementById('stickyWhatsapp');
  const agendeSection = document.getElementById('agende');
  const contatoSection = document.getElementById('contato') || document.querySelector('section:last-of-type');

  if (stickyWhatsapp) {
    const updateWhatsappVisibility = () => {
      const scrollY = window.scrollY;
      let shouldHide = scrollY < 250;

      // Check if user is looking at agende or contato (which already have prominent WhatsApp buttons)
      if (agendeSection) {
        const agendeRect = agendeSection.getBoundingClientRect();
        if (agendeRect.top < window.innerHeight && agendeRect.bottom > 60) {
          shouldHide = true;
        }
      }

      if (contatoSection) {
        const contatoRect = contatoSection.getBoundingClientRect();
        if (contatoRect.top < window.innerHeight - 80) {
          shouldHide = true;
        }
      }

      if (shouldHide) {
        stickyWhatsapp.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
        stickyWhatsapp.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      } else {
        stickyWhatsapp.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
        stickyWhatsapp.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
      }
    };

    window.addEventListener('scroll', updateWhatsappVisibility, { passive: true });
    updateWhatsappVisibility();
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
  const cardStackCounter = document.getElementById('cardStackCounter');

  if (cardStackStage) {
    const cards = Array.from(cardStackStage.querySelectorAll('.cardstack-card'));
    const totalCards = cards.length;
    let currentIndex = 0;
    let isAnimating = false;

    function updateCardStack() {
      cards.forEach((card, index) => {
        let pos;
        if (index < currentIndex) {
          pos = 'passed';
        } else {
          pos = index - currentIndex;
        }
        card.setAttribute('data-pos', pos === 'passed' ? 'passed' : (pos < 4 ? pos : 'hidden'));
        
        // Dynamic bottom hint
        const hintSpan = card.querySelector('.card-bottom-bar span:last-child');
        if (hintSpan) {
          hintSpan.textContent = `${index + 1} de ${totalCards}`;
        }
      });

      // Update button disabled states (sem loop!)
      if (cardStackPrev) {
        cardStackPrev.disabled = currentIndex === 0;
        cardStackPrev.setAttribute('aria-disabled', currentIndex === 0 ? 'true' : 'false');
      }
      if (cardStackNext) {
        cardStackNext.disabled = currentIndex >= totalCards - 1;
        cardStackNext.setAttribute('aria-disabled', currentIndex >= totalCards - 1 ? 'true' : 'false');
      }

      // Update counter pill
      if (cardStackCounter) {
        cardStackCounter.textContent = `${currentIndex + 1} de ${totalCards}`;
      }
    }

    function advanceCard() {
      if (isAnimating || currentIndex >= totalCards - 1) return;
      isAnimating = true;

      const currentCard = cards[currentIndex];
      if (currentCard) {
        currentCard.classList.add('card-flick-right');
      }

      setTimeout(() => {
        currentIndex++;
        if (currentCard) {
          currentCard.classList.remove('card-flick-right');
        }
        updateCardStack();
        isAnimating = false;
      }, 260);
    }

    function prevCard() {
      if (isAnimating || currentIndex <= 0) return;
      isAnimating = true;

      currentIndex--;
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

    // Button interactions
    if (cardStackNext) cardStackNext.addEventListener('click', advanceCard);
    if (cardStackPrev) cardStackPrev.addEventListener('click', prevCard);

    // Clicking directly on the front card advances to next (unless on last card)
    cardStackStage.addEventListener('click', (e) => {
      const clickedCard = e.target.closest('.cardstack-card');
      if (clickedCard && clickedCard.getAttribute('data-pos') === '0' && currentIndex < totalCards - 1) {
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
        if (diffX < 0 && currentIndex < totalCards - 1) {
          advanceCard(); // Swiped left -> next
        } else if (diffX > 0 && currentIndex > 0) {
          prevCard();    // Swiped right -> prev
        }
      }
    }, { passive: true });

    // Keyboard navigation (Left/Right arrow) when section is visible
    window.addEventListener('keydown', (e) => {
      const rect = cardStackStage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight' && currentIndex < totalCards - 1) {
        advanceCard();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
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
    const metodo = document.getElementById('metodo');
    const pinnedViewport = document.querySelector('.steps-pinned-viewport');
    const track = document.getElementById('stepsSliderTrack');
    const lineFill = document.getElementById('stepsAxisLineFill');

    if (!metodo || !pinnedViewport || !track || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Responsive setup: On desktop width (>= 1024px) AND adequate height (>= 580px)
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (min-height: 580px)", () => {
      const getScrollDistance = () => {
        const stageContainer = document.querySelector('.steps-stage-container');
        const containerWidth = stageContainer ? stageContainer.clientWidth : window.innerWidth;
        return Math.max(0, track.scrollWidth - containerWidth + 80);
      };

      const totalDist = getScrollDistance();
      const scrubDuration = totalDist + window.innerHeight * 1.5;

      // Master Timeline directly on #metodo (Zero parent overflow conflicts, 100% solid background)
      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          id: "metodoMasterTimeline",
          trigger: metodo,
          start: "top top",
          end: () => "+=" + scrubDuration,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      // Unified: track slide & line fill on the SAME timeline
      masterTimeline.to(track, {
        x: () => -totalDist,
        ease: "none",
        duration: 1
      }, 0);

      if (lineFill) {
        masterTimeline.fromTo(lineFill,
          { width: "0%" },
          { width: "100%", ease: "none", duration: 1 },
          0
        );
      }

      // Milestones scrubbed smoothly against masterTimeline
      const milestones = track.querySelectorAll('.step-milestone');
      milestones.forEach((item) => {
        const stepNum = parseInt(item.getAttribute('data-step') || '1', 10);
        const isTop = item.classList.contains('step-milestone-top');
        const stem = item.querySelector('.step-stem');
        const dot = item.querySelector('.step-dot') || item.querySelector('.rounded-full');
        const content = item.querySelector('.step-content') || item.querySelector('div[class*="space-y-"]');

        if (stepNum === 1) {
          // Passo 1 starts directly visible in center
          if (stem) gsap.set(stem, { scaleY: 1 });
          if (dot) gsap.set(dot, { scale: 1, opacity: 1, boxShadow: "0 0 20px rgba(244,197,66,0.95)" });
          if (content) gsap.set(content, { opacity: 1, y: 0 });

          gsap.to(item, {
            opacity: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: item,
              containerAnimation: masterTimeline,
              start: "left 20%",
              end: "left 2%",
              scrub: 0.5
            }
          });
          return;
        }

        // Passos 2, 3, 4, 5, 6:
        if (stem) gsap.set(stem, { scaleY: 0 });
        if (dot) gsap.set(dot, { scale: 0, opacity: 0 });
        if (content) gsap.set(content, { opacity: 0, y: isTop ? 28 : -28 });

        const itemTl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            containerAnimation: masterTimeline,
            start: "left 90%",
            end: "left 60%",
            scrub: 0.5
          }
        });

        if (stem) {
          itemTl.to(stem, { scaleY: 1, ease: "power1.out", duration: 0.4 }, 0);
        }
        if (dot) {
          itemTl.to(dot, {
            scale: 1,
            opacity: 1,
            boxShadow: "0 0 20px rgba(244,197,66,0.95)",
            ease: "back.out(1.5)",
            duration: 0.35
          }, 0.1);
        }
        if (content) {
          itemTl.to(content, { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 0.15);
        }

        gsap.to(item, {
          opacity: 0,
          ease: "power1.out",
          scrollTrigger: {
            trigger: item,
            containerAnimation: masterTimeline,
            start: "left 18%",
            end: "left 2%",
            scrub: 0.5
          }
        });
      });

      // Cleanup when leaving desktop breakpoint
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

    // Compact Windows (< 1024px ou altura < 580px): reset inline transforms
    mm.add("(max-width: 1023px), (max-height: 579px)", () => {
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
      }, 200);
    });
  }

  initStepsTimeline();
});


