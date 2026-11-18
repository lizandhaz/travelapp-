import { router } from 'expo-router';
import { useState } from 'react';

import { TripForm } from '@/components/trip/TripForm';

/** The centre "Add" tab: add a trip. After saving, opens the new trip and starts a fresh form. */
export default function AddTrip() {
  const [formKey, setFormKey] = useState(0);
  return (
    <TripForm
      key={formKey}
      title="Add a trip"
      onSaved={(id) => {
        setFormKey((k) => k + 1);
        router.push(`/trip/${id}`);
      }}
    />
  );
}
