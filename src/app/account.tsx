import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, TextInput } from 'react-native';
import { Btn, C, Card, Chips, Screen, T, s as ui } from '../components/ui';
import { useSync } from '../sync';

export default function Account() {
  const { session, status, signIn, signUp, signOut } = useSync();
  const [mode, setMode] = useState<'Logga in' | 'Skapa konto'>('Logga in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (session) {
    const out = () => {
      const msg = 'Din data finns kvar i molnet och kommer tillbaka när du loggar in igen. Telefonen töms.';
      if (Platform.OS === 'web') { if (window.confirm(`Logga ut?\n\n${msg}`)) signOut(); }
      else Alert.alert('Logga ut?', msg, [{ text: 'Avbryt' }, { text: 'Logga ut', style: 'destructive', onPress: () => signOut() }]);
    };
    return (
      <Screen>
        <Card title="Inloggad">
          <T>{session.user.email}</T>
          <T color={status === 'fel' ? C.bad : C.good}>
            {status === 'synkad' ? '✓ Allt är sparat i molnet' : status === 'synkar' ? 'Synkar…' : status === 'fel' ? 'Kunde inte synka – försöker igen när du har täckning' : ''}
          </T>
          <T dim size={13}>Logga in med samma konto på en annan telefon eller dator så får du samma hojar, timmar, service och mappar där.</T>
          <Btn kind="danger" title="Logga ut" onPress={out} />
        </Card>
      </Screen>
    );
  }

  const submit = async () => {
    setError(null);
    if (!email.includes('@')) return setError('Skriv in din e-postadress.');
    if (password.length < 6) return setError('Lösenordet måste vara minst 6 tecken.');
    setBusy(true);
    const err = mode === 'Logga in' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (err) setError(err);
    else router.back();
  };

  return (
    <Screen>
      <Card>
        <T>Med ett konto sparas allt i molnet – hojar, timmar, service, loggar och mappar. Du kan använda samma konto på flera enheter.</T>
        <T dim size={13}>Det du redan har lagt in följer med när du loggar in.</T>
      </Card>
      <Card>
        <Chips options={['Logga in', 'Skapa konto'] as const} value={mode} onChange={(m) => { setMode(m); setError(null); }} />
        <T dim size={13}>E-post</T>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="namn@exempel.se" placeholderTextColor="#5c6370" style={ui.input} />
        <T dim size={13}>Lösenord {mode === 'Skapa konto' ? '(minst 6 tecken)' : ''}</T>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'Logga in' ? 'current-password' : 'new-password'} placeholder="••••••" placeholderTextColor="#5c6370" style={ui.input} onSubmitEditing={submit} />
        {error ? <T color={C.bad}>{error}</T> : null}
        <Btn title={busy ? 'Vänta…' : mode} onPress={() => { if (!busy) submit(); }} />
      </Card>
    </Screen>
  );
}
