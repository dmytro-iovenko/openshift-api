import { Card, CardContent, CardActions, Typography, Button } from "@mui/material";
import { Application } from "../types/Application";
// import ApplicationForm from "./ApplicationForm";

/**
 * ApplicationCard componentt to display individual application details.
 *
 * @param {Object} props - Component properties.
 * @param {Application} props.application - The application data to display.
 * @param {Function} props.onEdit - Callback function for editing the application.
 * @param {Function} props.onDelete - Callback function for deleting the application.
 * @returns {JSX.Element} The rendered application card.
 */
const ApplicationCard = ({
  application,
  onEdit,
  onDelete,
}: {
  application: Application;
  onEdit: () => void;
  onDelete: () => void;
}): JSX.Element => {
  return (
    <Card sx={{ maxWidth: 345, margin: 2 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {application.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Docker Image: {application.image}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Deployment Name: {application.deploymentName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created At: {new Date(application.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Updated At: {new Date(application.updatedAt).toLocaleString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" onClick={onEdit}>
          Edit
        </Button>
        <Button size="small" color="secondary" onClick={onDelete}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default ApplicationCard;
