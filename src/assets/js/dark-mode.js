document.addEventListener('DOMContentLoaded', (event) => {
	const darkmodeOn = localStorage.getItem('darkmode');

	const checkbox = document.getElementById('darkmode');

	if (darkmodeOn) {
		document.body.classList.add('dark-mode');
		checkbox.checked = true;
		setCheckboxListener();
	} else {
		setCheckboxListener()
	}

	function setCheckboxListener() {
		checkbox.addEventListener('change', (event) => {
			if (event.currentTarget.checked) {
				localStorage.setItem('darkmode', true);
				document.body.classList.add('dark-mode');
			} else {
				localStorage.removeItem('darkmode');
				document.body.classList.remove('dark-mode');
			}
		  });
	}
})