import { IconButton, Link, Tooltip } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const GITHUB_LINK = import.meta.env.VITE_GITHUB_LINK || "https://github.com/dmytro-iovenko";

const ToolbarButtons = () => (
  <Tooltip title="Link to GitHub project" enterDelay={1000}>
    <Link href={GITHUB_LINK}>
      <IconButton type="button">
        <GitHubIcon />
      </IconButton>
    </Link>
  </Tooltip>
);

export default ToolbarButtons;