document.addEventListener('DOMContentLoaded', (event) => {
	const checkbox = document.getElementById('darkmode');
	
	// Function to apply dark mode
	function applyDarkMode(isDark) {
		if (isDark) {
			document.body.classList.add('dark-mode');
			checkbox.checked = true;
		} else {
			document.body.classList.remove('dark-mode');
			checkbox.checked = false;
		}
	}
	
	// Function to get OS dark mode preference
	function getOSDarkModePreference() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	
	// Initialize dark mode based on user preference or OS preference
	function initializeDarkMode() {
		const userPreference = localStorage.getItem('darkmode');
		
		if (userPreference !== null) {
			// User has made a choice, respect it
			applyDarkMode(userPreference === 'true');
		} else {
			// No user preference, use OS preference
			const prefersDark = getOSDarkModePreference();
			applyDarkMode(prefersDark);
		}
	}
	
	// Listen for OS preference changes (only if user hasn't made a choice)
	function setupOSPreferenceListener() {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		
		mediaQuery.addEventListener('change', (e) => {
			// Only respond to OS changes if user hasn't made a manual choice
			if (localStorage.getItem('darkmode') === null) {
				applyDarkMode(e.matches);
			}
		});
	}
	
	// Manual toggle handler
	function setupManualToggle() {
		checkbox.addEventListener('change', (event) => {
			const isDark = event.currentTarget.checked;
			
			if (isDark) {
				localStorage.setItem('darkmode', 'true');
			} else {
				localStorage.setItem('darkmode', 'false');
			}
			
			applyDarkMode(isDark);
		});
	}
	
	// Initialize everything
	initializeDarkMode();
	setupOSPreferenceListener();
	setupManualToggle();
})