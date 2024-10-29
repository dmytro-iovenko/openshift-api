import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { fetchApplications } from "../services/api";
import { Application } from '../types/Application';

/**
 * Applications component fetches and displays a list of applications.
 * @returns {JSX.Element} The applications listing UI or loading state.
 */
const Applications: React.FC = (): JSX.Element => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadApplications = async () => {
      const data = await fetchApplications();
      setApplications(data);
      setLoading(false);
    };

    loadApplications();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h2>Applications</h2>
      <ul>
        {applications.map((app) => (
          <li key={app.id}>{app.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Applications;
