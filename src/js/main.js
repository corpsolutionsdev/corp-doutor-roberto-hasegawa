/**
 * Main JavaScript file for Dr. Roberto Hasegawa website
 * Handles navigation, scroll effects, menu interactions, and animations
 */

const getElements = () => {
  const navigation = document.querySelector('#navigation')
  const backToTopButton = document.querySelector('#backToTopButton')
  const home = document.querySelector('#home')
  const services = document.querySelector('#services')
  const about = document.querySelector('#about')
  const contact = document.querySelector('#contact')

  return {
    navigation,
    backToTopButton,
    home,
    services,
    about,
    contact
  }
}

/**
 * Shows navigation background when scrolling
 */
const showNavOnScroll = (navigation) => {
  if (!navigation) return

  if (window.scrollY > 0) {
    navigation.classList.add('scroll')
  } else {
    navigation.classList.remove('scroll')
  }
}

/**
 * Shows back to top button when scrolling down
 */
const showBackToTopButtonOnScroll = (backToTopButton) => {
  if (!backToTopButton) return

  const SCROLL_THRESHOLD = 550

  if (window.scrollY > SCROLL_THRESHOLD) {
    backToTopButton.classList.add('show')
  } else {
    backToTopButton.classList.remove('show')
  }
}

/**
 * Activates menu item based on current scroll position
 */
const activateMenuAtCurrentSection = (section, navigation) => {
  if (!section || !navigation) return

  const targetLine = window.scrollY + window.innerHeight / 2
  const sectionTop = section.offsetTop
  const sectionHeight = section.offsetHeight
  const sectionEndsAt = sectionTop + sectionHeight

  const sectionTopReachedOrPassed = targetLine >= sectionTop
  const sectionEndPassed = sectionEndsAt <= targetLine
  const sectionBoundaries = sectionTopReachedOrPassed && !sectionEndPassed

  const sectionId = section.getAttribute('id')
  if (!sectionId) return

  const menuElement = navigation.querySelector(`.menu a[href*="${sectionId}"]`)
  if (!menuElement) return

  menuElement.classList.toggle('active', sectionBoundaries)
}

/**
 * Handles scroll events
 */
const handleScroll = (elements) => {
  const { navigation, backToTopButton, home, services, about, contact } = elements

  showNavOnScroll(navigation)
  showBackToTopButtonOnScroll(backToTopButton)

  const sections = [home, services, about, contact]
  sections.forEach(section => {
    activateMenuAtCurrentSection(section, navigation)
  })
}

/**
 * Opens mobile menu
 */
const openMenu = () => {
  document.body.classList.add('menu-expanded')
}

/**
 * Closes mobile menu
 */
const closeMenu = () => {
  document.body.classList.remove('menu-expanded')
}

// ============================================
// NUMBER ANIMATION
// ============================================

/**
 * Formats number with thousand separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
const formatNumber = (num) => {
  const floorNum = Math.floor(num)
  
  if (floorNum >= 1000) {
    return floorNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  
  return floorNum.toString()
}

/**
 * Animates a number from 0 to target value
 * @param {HTMLElement} element - DOM element to update
 * @param {number} target - Target number value
 * @param {string} prefix - Prefix to add before number (e.g., '+')
 * @param {number} duration - Animation duration in milliseconds
 */
const animateNumber = (element, target, prefix = '', duration = 2000) => {
  if (!element || !target || isNaN(target)) return

  const FRAME_RATE = 60
  const FRAME_INTERVAL = 1000 / FRAME_RATE
  const totalFrames = duration / FRAME_INTERVAL
  const increment = target / totalFrames
  
  let current = 0
  let frame = 0

  const timer = setInterval(() => {
    frame++
    current += increment

    if (current >= target || frame >= totalFrames) {
      current = target
      clearInterval(timer)
    }

    const formatted = formatNumber(current)
    element.textContent = prefix + formatted
  }, FRAME_INTERVAL)
}

/**
 * Initializes number animation with Intersection Observer
 */
const initNumberAnimation = () => {
  const statsSection = document.querySelector('#home .stats')
  const statNumbers = document.querySelectorAll('.stat h3[data-target]')

  if (!statsSection || statNumbers.length === 0) {
    return
  }

  let hasAnimated = false

  const startAnimation = () => {
    if (hasAnimated) return

    hasAnimated = true

    statNumbers.forEach((statElement) => {
      const target = parseInt(statElement.getAttribute('data-target'), 10)
      const prefix = statElement.getAttribute('data-prefix') || ''

      if (target && !isNaN(target)) {
        animateNumber(statElement, target, prefix)
      }
    })
  }

  const checkVisibilityAndStart = () => {
    const rect = statsSection.getBoundingClientRect()
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0

    if (isVisible) {
      // Section already visible, wait for AOS to finish
      setTimeout(startAnimation, 300)
    } else {
      // Use Intersection Observer for sections not yet visible
      const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(startAnimation, 100)
            observer.disconnect()
          }
        })
      }, observerOptions)

      observer.observe(statsSection)
    }
  }

  // Wait for AOS animation to complete
  setTimeout(checkVisibilityAndStart, 400)
}

// ============================================
// AOS (ANIMATE ON SCROLL) INITIALIZATION
// ============================================

/**
 * Initializes AOS (Animate On Scroll) library
 */
const initAOS = () => {
  if (typeof AOS === 'undefined') {
    console.warn('AOS library not loaded')
    return
  }

  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100,
    delay: 0
  })
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initializes all functionality when DOM is ready
 */
const init = () => {
  const elements = getElements()

  // Initialize scroll effects
  window.addEventListener('scroll', () => handleScroll(elements))
  handleScroll(elements) // Run once on load

  // Initialize AOS
  initAOS()

  // Initialize number animations
  initNumberAnimation()
}

// ============================================
// EVENT LISTENERS
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  // DOM already loaded
  init()
}

// Expose menu functions globally for onclick handlers in HTML
window.openMenu = openMenu
window.closeMenu = closeMenu
