export default function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        background: "#f9fafb",
        color: "#111",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        Welcome to{" "}
        <span style={{ color: "#2563eb" }}>test-react</span> 🚀
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "2rem" }}>
        Your project is ready. Start building amazing things!
      </p>
      
      
    </div>
  );
}