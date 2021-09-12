import './App.css';

function App() {
  return (
    <>
      <div className="container">
        <h1> Random projects</h1>
        <ol>
          <li><a href="fractals/index.html"> Mandelbrot Fractal </a> <span className="right"> (Drag mouse and scroll to interact)</span></li>
          <li><a href="portfolio/index.html"> Lines </a> <span className="right">(Use arrow keys) </span></li>
          <li><a href="walking_p5/index.html"> Footsteps </a> <span className="right">(Use arrow keys or mouseclicks) </span></li>
          <li><a href="chesspath/index.html"> Prince Chazz </a> <span className="right">(Chess with a twist) </span></li>
          <li><a href="card_js/index.html"> Card JS </a></li>
          <li><a href="rain_p5/index.html"> Rain </a> <span className="right">(Move around your mouse) </span> </li>
          <li><a href="qr_scan/index.html"> QR code test </a> <span className="right">(Try holding a QR code in front of your webcam) </span></li>
          <li><a href="p5_frames/index.html"> Funky frames </a> <span className="right">Move the mouse, and press r, c, p and m </span></li>
          <li><a href="funky_snake/index.html"> Funky Snake</a> <span className="right">(Use arrow keys) </span></li>
        </ol>
      </div>
      <h2 id="secretsloth"> &#x1F9A5;</h2>
    </>
  );
}

export default App;
