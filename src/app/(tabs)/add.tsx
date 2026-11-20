import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { TripForm } from '@/components/trip/TripForm';

/**
 * The "+" in the tab bar: add a trip. After saving, opens the new trip and starts a fresh form.
 * A place page's "I've been" opens this with ?place=…&country=… to fill in where you went.
 */
export default function AddTrip() {
  const [formKey, setFormKey] = useState(0);
  const { place, country } = useLocalSearchParams<{ place?: string; country?: string }>();
  return (
    <TripForm
      key={`${formKey}-${place ?? ''}`}
      startPlace={place ? { name: place, country: country ?? '' } : undefined}
      onSaved={(id) => {
        setFormKey((k) => k + 1);
        router.push(`/trip/${id}`);
      }}
    />
  );
}
