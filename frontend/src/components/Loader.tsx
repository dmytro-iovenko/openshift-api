import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

/**
 * Loader component to display a loading spinner.
 * @returns {JSX.Element} The loader UI.
 */
const Loader = (): JSX.Element => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
);

export default Loader;
