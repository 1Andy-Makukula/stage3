import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Just render the App. All logic happens inside the React lifecycle.
createRoot(document.getElementById("root")!).render(<App />);