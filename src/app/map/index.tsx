import { useLocalSearchParams } from 'expo-router';
import { ImportView } from '../../components/ImportView';
import { Screen } from '../../components/ui';

// Djuplänk: mxex://map?d=… öppnar appen här.
export default function MapLink() {
  const { d } = useLocalSearchParams<{ d?: string }>();
  return (
    <Screen>
      <ImportView initial={d ? `?d=${encodeURIComponent(d)}` : undefined} />
    </Screen>
  );
}
