import { useEffect, useState } from "react";
import { fetchDeployments, createDeployment, deleteDeployment, updateDeployment } from "../services/api"; // Create corresponding API service functions
import DeploymentCard from "../components/DeploymentCard"; // Component to display each deployment
import DeploymentForm from "../components/DeploymentForm"; // Form for adding/editing deployments
import Loader from "../components/Loader";

const Deployments: React.FC<{ appId: string }> = ({ appId }) => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentDeployment, setCurrentDeployment] = useState(null);

  useEffect(() => {
    const loadDeployments = async () => {
      const data = await fetchDeployments(appId);
      setDeployments(data);
      setLoading(false);
    };

    loadDeployments();
  }, [appId]);

  const handleFormSubmit = async (data) => {
    if (currentDeployment) {
      await updateDeployment(currentDeployment._id, data);
    } else {
      await createDeployment(appId, data);
    }
    // Refresh deployments after creation/update
  };

  const handleDelete = async (id) => {
    await deleteDeployment(appId, id);
    // Refresh deployments after deletion
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1>Deployments</h1>
      <button onClick={() => setOpenForm(true)}>Add Deployment</button>
      {deployments.map((deployment) => (
        <DeploymentCard key={deployment._id} deployment={deployment} onDelete={() => handleDelete(deployment._id)} />
      ))}
      <DeploymentForm open={openForm} onClose={() => setOpenForm(false)} onSubmit={handleFormSubmit} />
    </div>
  );
};
