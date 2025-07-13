import { useState, useEffect } from "react";

interface DiscordActivity {
  name: string;
  type: number;
  details?: string;
  state?: string;
  status: string;
  customStatus?: string;
  typeText: string;
}

export function DiscordActivityDisplay() {
  const [activity, setActivity] = useState<DiscordActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/discord/activity');
        if (response.ok) {
          const data = await response.json();
          setActivity(data);
        } else {
          setError('Failed to fetch Discord activity');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchActivity();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchActivity, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">No Discord activity detected</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'dnd': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'idle': return 'bg-yellow-400';
      case 'dnd': return 'bg-red-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusDot(activity.status)}`}></div>
        <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </span>
      </div>

      {activity.customStatus && (
        <div className="bg-gray-700 rounded p-2">
          <p className="text-sm text-gray-300">
            <span className="text-gray-400">Custom Status:</span> {activity.customStatus}
          </p>
        </div>
      )}

      <div className="bg-gray-700 rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-400 text-sm font-medium">{activity.typeText}</span>
          <span className="text-white font-medium">{activity.name}</span>
        </div>
        
        {activity.details && (
          <p className="text-sm text-gray-300 mb-1">{activity.details}</p>
        )}
        
        {activity.state && (
          <p className="text-sm text-gray-400">{activity.state}</p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Live from Discord Gateway</span>
      </div>
    </div>
  );
}