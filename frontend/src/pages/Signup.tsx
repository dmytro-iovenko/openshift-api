import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import { styled } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
  },
}));

export default function SignUp(_props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");

  const { signup, error, setError } = useContext(AuthContext)!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleSignIn = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError("");
    navigate("/login");
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const name = document.getElementById("name") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 1) {
      setPasswordError(true);
      setPasswordErrorMessage("Password is required.");
      isValid = false;
    } else if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    }
    if (!password.value || !/\d/.test(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must contain a number.");
      isValid = false;
    }
    if (!password.value || !/[A-Z]/.test(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must contain an uppercase letter.");
      isValid = false;
    }
    if (!password.value || !/[a-z]/.test(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must contain a lowercase letter.");
      isValid = false;
    }
    if (!password.value || !/[@$!%*?&]/.test(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must contain a special character (@$!%*?&).");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage("Name is required.");
      isValid = false;
    } else if (!name.value || name.value.length < 3) {
      setNameError(true);
      setNameErrorMessage("Name must be at least 3 characters long");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (nameError || emailError || passwordError) {
      return;
    }
    console.log("name", name);
    console.log("email", email);
    console.log("password", password);

    signup(email, password, name);
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
            <ViewInArOutlinedIcon sx={{ width: "32px", height: "32px" }} />
            <Typography variant="h6" sx={{}}>
              ShiftHub
            </Typography>
          </Box>
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign up
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? "error" : "primary"}
                autoComplete="name"
                placeholder="Jon Snow"
                required
                fullWidth
                autoFocus
                tabIndex={0}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                helperText={emailErrorMessage}
                color={passwordError ? "error" : "primary"}
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                variant="outlined"
                required
                fullWidth
                tabIndex={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
                type="password"
                placeholder="••••••"
                autoComplete="new-password"
                variant="outlined"
                required
                fullWidth
                tabIndex={2}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive updates via email."
            />
            {error && (
              <Typography color="error" variant="body2" align="center">
                {error}
              </Typography>
            )}

            <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
              Sign up
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <span>
                <Link component="button" variant="body2" onClick={handleSignIn}>
                  Sign in
                </Link>
              </span>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </>
  );
}
