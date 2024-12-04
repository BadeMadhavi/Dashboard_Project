import Dashboard from "./Dashboard/DashBoard";
import { ThemeProvider } from "./Dashboard/ThemeContext";

function App(){
  return(
    <div>
    <ThemeProvider>
    <Dashboard/>
    </ThemeProvider>
  
    </div>
  )
}
export default App;
