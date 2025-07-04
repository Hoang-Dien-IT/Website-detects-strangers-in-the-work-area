import React from 'react';

interface DetectionAlertsProps {
  className?: string;
  maxAlerts?: number;
  showOnlyUnread?: boolean;
}

const DetectionAlerts: React.FC<DetectionAlertsProps> = ({
  className = '',
  maxAlerts = 10,
  showOnlyUnread = false
}) => {
  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Detection Alerts</h3>
      <div className="text-center py-8">
        <p className="text-gray-500">No detection alerts</p>
        <p className="text-sm text-gray-400">All quiet on the security front</p>
      </div>
    </div>
  );
};

export default DetectionAlerts;
