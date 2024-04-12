import { Button, Input } from "@mui/material";

const Login: React.FC = () => {
  return (
    <div className="home" style={{ margin: "10px" }}>
      <h1>Start with Login</h1>
      <p>Please enter your credentials to login:</p>
      <div style={{}}>
      <Input style={{ margin: "5px", backgroundColor: "lightgrey", borderRadius: "5px", padding: "5px" }} placeholder="Your Email" />
      <Input style={{  margin: "5px", backgroundColor: "lightgrey", borderRadius: "5px", padding: "5px" }} placeholder="Password" />    
      </div>
      <Button variant="contained" color="primary" style={{marginTop: "10px"}}>Login</Button>
    </div>
  );
};

export default Login;