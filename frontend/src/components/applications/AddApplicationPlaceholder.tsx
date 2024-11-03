import React from 'react';
import { Card, CardContent, Avatar, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AddApplicationPlaceholderProps {
  onClick: () => void;
}

const AddApplicationPlaceholder: React.FC<AddApplicationPlaceholderProps> = ({ onClick }) => {
  return (
    <Card
      aria-label="Click to add a new application"
      sx={{ height: 1, border: '1px dashed', borderColor: 'primary.main' }}
      onClick={onClick}
    >
      <Button sx={{ height: 1, width: 1 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Avatar sx={{ width: 80, height: 80, backgroundColor: 'grey.200' }}>
            <AddIcon fontSize="large" color="primary" />
          </Avatar>
        </CardContent>
      </Button>
    </Card>
  );
};

export default AddApplicationPlaceholder;
