import React, { useRef, useState, useEffect } from "react";

const WHEEL_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#C9CBCF",
  "#FF6384",
  "#36A2EB",
  "#FFCE56"
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawWheel(ctx, names, rotation) {
  const size = 300;
  const center = size / 2;
  const radius = center - 10;
  const arc = (2 * Math.PI) / names.length;

  ctx.clearRect(0, 0, size, size);

  // Draw slices
  for (let i = 0; i < names.length; i++) {
    const angle = i * arc + rotation;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + arc, false);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();
    ctx.save();

    // Draw text
    ctx.translate(center, center);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(names[i], radius - 10, 5);
    ctx.restore();
  }

  // Draw center circle
  ctx.beginPath();
  ctx.arc(center, center, 40, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Draw pointer (moved 90 degrees clockwise, now points right)
  ctx.beginPath();
  ctx.moveTo(center + radius + 10, center); // tip of the pointer
  ctx.lineTo(center + radius - 20, center - 15);
  ctx.lineTo(center + radius - 20, center + 15);
  ctx.closePath();
  ctx.fillStyle = "#333";
  ctx.fill();
}

function getWinnerIndex(rotation, names) {
  const arc = (2 * Math.PI) / names.length;
  const normalized = (2 * Math.PI - (rotation % (2 * Math.PI))) % (2 * Math.PI);
  return Math.floor(normalized / arc) % names.length;
}

export default function App() {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [names, setNames] = useState([]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    drawWheel(ctx, names, rotation);
  }, [rotation, names]);

  const spinWheel = () => {
    if (spinning) return;
    setWinner(null);
    setSpinning(true);
    const spins = getRandomInt(5, 8);
    const finalRotation = rotation + spins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 4000;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRotation = rotation + (finalRotation - rotation) * ease;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const winnerIdx = getWinnerIndex(finalRotation, names);
        setWinner(names[winnerIdx]);
      }
    }
    requestAnimationFrame(animate);
  };

  const handleAddName = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setNames([...names, e.target.value]);
      e.target.value = '';
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        margin: 0,
        padding: "20px",
        boxSizing: "border-box",
        textAlign: "center",
        background: "linear-gradient(135deg, #6264A7 0%, #464775 40%, #8A8DFF 100%)"
      }}
    >
      <h1 style={{ color: "#fff", fontFamily: "Arial, sans-serif" }}>Roulette Wheel</h1>
      <input
        type="text"
        placeholder="Enter a name and press Enter"
        onKeyDown={handleAddName}
        style={{ marginBottom: "20px", padding: "10px", fontSize: "16px", borderRadius: "5px", border: "none" }}
      />
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{ border: "2px solid #fff", borderRadius: "50%" }}
      />
      <div style={{ margin: "20px" }}>
        <button onClick={spinWheel} disabled={spinning || names.length === 0} style={{ padding: "10px 20px", fontSize: "16px", borderRadius: "5px", border: "none", background: "#36A2EB", color: "#fff", cursor: "pointer" }}>
          {spinning ? "Spinning..." : "Spin"}
        </button>
      </div>
      {winner && (
        <h2 style={{ color: "#fff", fontFamily: "Arial, sans-serif" }}>
          🎉 Winner: <span style={{ color: "#36A2EB" }}>{winner}</span> 🎉
        </h2>
      )}
    </div>
  );
}