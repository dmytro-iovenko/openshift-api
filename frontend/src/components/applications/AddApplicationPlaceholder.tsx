import React from "react";
import { Card, CardContent, Avatar, Button, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface AddApplicationPlaceholderProps {
  onClick: () => void;
}

const AddApplicationPlaceholder: React.FC<AddApplicationPlaceholderProps> = ({ onClick }) => {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === "dark" ? "grey.900" : "grey.100";

  return (
    <Card
      aria-label="Click to add a new application"
      sx={{ height: 1, border: "1px dashed", borderColor: "primary.main" }}
      onClick={onClick}>
      <Button sx={{ height: 1, width: 1 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Avatar sx={{ width: 80, height: 80, backgroundColor }}>
            <AddIcon fontSize="large" color="primary" />
          </Avatar>
        </CardContent>
      </Button>
    </Card>
  );
};

export default AddApplicationPlaceholder;
