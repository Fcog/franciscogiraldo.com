<!DOCTYPE html>
<html>
<head>
	<title>Francisco Giraldo - Web Developer</title>
	<link rel="stylesheet" type="text/css" href="styles.css">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/css-doodle/0.5.1/css-doodle.min.js"></script>
</head>
<body>
<css-doodle>
  :doodle {
    @grid: 50x1 / 100%;
    @use: var(--filter);
  }
  :container {
    animation: r 20s linear infinite;
  }
  @place-cell: center;
  @size: 100% 2vmin;
  background: @pd(#60569e, #e6437d, #ebbf4d);
  transform-origin: 1vmin center;
  transform:
    translateX(50%)
    rotate(calc(@i() * 360deg / @size()));

  @keyframes r {
    to { transform: rotate(1turn) }
  }
</css-doodle>
<section class="main">
  <div class="container">
  	<h1>Francisco Giraldo</h1>
  	<h2>Computer Systems Engineer<br>specialized in Web Development</h2>
  	<a href="https://www.linkedin.com/in/franciscogiraldo/">Linked In Profile</a>
  </div>
</section>
</body>
</html>