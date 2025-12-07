/**
 * TimeAgo component - Displays elapsed time since order creation
 * Updates every minute to show current elapsed time
 */

import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

interface TimeAgoProps {
  date: Date;
  className?: string;
}

export default function TimeAgo({ date, className = '' }: TimeAgoProps) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeString('hace menos de 1 min');
      } else if (diffMins === 1) {
        setTimeString('hace 1 min');
      } else if (diffMins < 60) {
        setTimeString(`hace ${diffMins} min`);
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (mins === 0) {
          setTimeString(`hace ${hours}h`);
        } else {
          setTimeString(`hace ${hours}h ${mins}m`);
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <Text className={className}>{timeString}</Text>;
}
